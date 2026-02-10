from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import Any, Dict, List, Optional

from .settings import settings
from .models import AnalyzeRequest, AnalyzeResponse, AnalyzeResult

app = FastAPI(title="Smishing Guard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


def _coerce_label(label: Any) -> str:
    """모델이 주는 다양한 라벨을 프론트 규격(스미싱/정상/불명)으로 정규화"""
    if label is None:
        return "불명"
    s = str(label).strip()
    if s in ["스미싱", "정상", "불명"]:
        return s

    low = s.lower()
    # 흔한 영문/축약 라벨 흡수
    smish_alias = {"smishing", "phishing", "scam", "spam", "malicious", "fraud", "unsafe", "danger"}
    safe_alias = {"safe", "normal", "benign", "ham", "legit", "clean"}
    unknown_alias = {"unknown", "uncertain", "unsure", "maybe", "other"}

    if low in smish_alias:
        return "스미싱"
    if low in safe_alias:
        return "정상"
    if low in unknown_alias:
        return "불명"

    # 문장형 verdict일 수도 있으니 키워드로 한 번 더
    if any(k in low for k in ["smish", "phish", "scam", "fraud", "malicious", "스미싱", "피싱", "사기"]):
        return "스미싱"
    if any(k in low for k in ["safe", "benign", "정상", "안전"]):
        return "정상"

    return "불명"


def _to_reason_list(x: Any) -> List[str]:
    """reasons/evidence/explanation 등을 안전하게 List[str]로 변환"""
    out: List[str] = []

    if x is None:
        return out

    if isinstance(x, str):
        # ✅ "프론트에 보이는 그대로"를 우선하되,
        # 사용자가 원하는 UI(제목 줄 + 설명 줄) 형태로 오는 경우(2줄 단위 반복)는
        # 프론트 렌더링이 쉽도록 ["제목\n설명", ...] 리스트로 변환합니다.
        s = x.strip()
        if not s:
            return []

        # 불릿/번호 형식은 그대로 한 덩어리로 유지
        lines_raw = s.splitlines()
        has_bullets = any(l.strip().startswith(('-', '•', '*')) for l in lines_raw if l.strip())
        if has_bullets:
            return [s]

        lines = [l.strip() for l in lines_raw if l.strip()]
        # 2줄(제목/설명) 패턴이 반복되는 것으로 보이면 pair로 묶음
        if len(lines) >= 4 and len(lines) % 2 == 0:
            paired: List[str] = []
            for i in range(0, len(lines), 2):
                title = lines[i]
                detail = lines[i + 1]
                paired.append(f"{title}\n{detail}".strip())
            return paired

        return [s]

    if isinstance(x, list):
        for item in x:
            if item is None:
                continue
            if isinstance(item, str):
                s = item.strip()
                if s:
                    out.append(s)
            elif isinstance(item, dict):
                # 흔한 형태: {"text": "..."} / {"reason": "..."}
                for k in ["text", "reason", "evidence", "explanation", "content", "message"]:
                    if k in item and isinstance(item[k], str) and item[k].strip():
                        out.append(item[k].strip())
                        break
                else:
                    # fallback: dict를 문자열화
                    out.append(str(item))
            else:
                out.append(str(item))
        return [s for s in out if s.strip()]

    if isinstance(x, dict):
        # dict 자체가 {"reasons": [...]} 같은 구조일 수 있음
        for k in ["reasons", "evidence", "explanation", "reason", "patterns"]:
            if k in x:
                return _to_reason_list(x.get(k))
        return [str(x)]

    return [str(x)]


def _deep_get_first(obj: Any, keys: List[str]) -> Optional[Any]:
    """중첩 dict에서 keys 중 하나를 발견하면 그 값을 반환 (깊이 제한 있음)."""
    if not isinstance(obj, dict):
        return None

    # 1) 현재 레벨
    for k in keys:
        if k in obj:
            return obj.get(k)

    # 2) 한 단계 더
    for v in obj.values():
        if isinstance(v, dict):
            for k in keys:
                if k in v:
                    return v.get(k)

    # 3) 두 단계 더 (LLM 응답이 {result:{llm:{...}}} 같이 깊을 때)
    for v in obj.values():
        if isinstance(v, dict):
            for vv in v.values():
                if isinstance(vv, dict):
                    for k in keys:
                        if k in vv:
                            return vv.get(k)

    return None


def _normalize_model_response(data: Dict[str, Any], fallback_request_id: str) -> AnalyzeResponse:
    # 가능한 필드 후보들을 최대한 흡수해서 표준 형태로 변환
    req_id = data.get("request_id") or data.get("requestId") or fallback_request_id

    # result가 nested일 수도, top-level일 수도 있음
    result = data.get("result") if isinstance(data.get("result"), dict) else data

    # 1) label 정규화 (영문/다른 표현도 흡수)
    raw_label = (
        result.get("label")
        or result.get("verdict")
        or result.get("class")
        or result.get("category")
        or _deep_get_first(result, ["label", "verdict", "class", "category"])
    )
    label = _coerce_label(raw_label)

    # 2) score
    score = result.get("score") or result.get("risk_score") or result.get("confidence")
    try:
        score = float(score) if score is not None else None
    except Exception:
        score = None

    # 3) reasons/evidence 추출: 다양한 키를 후보로 사용
    candidates = [
        result.get("reasons"),
        result.get("reasons_kor"),
        result.get("patterns"),
        result.get("evidence"),
        result.get("evidences"),
        result.get("rationale"),
        result.get("justification"),
        result.get("grounding"),
        result.get("supporting_facts"),
        _deep_get_first(result, [
            "reasons", "reasons_kor", "patterns", "evidence", "evidences",
            "rationale", "justification", "grounding", "supporting_facts",
            "explanation", "reason"
        ]),
    ]

    reasons: List[str] = []
    for c in candidates:
        reasons = _to_reason_list(c)
        if reasons:
            break

    # 4) explanation / reason만 있을 경우 라인 단위로 분해
    if not reasons:
        expl = result.get("explanation") or result.get("reason") or _deep_get_first(result, ["explanation", "reason"])
        reasons = _to_reason_list(expl)

    # 5) reasons가 너무 길면 프론트 UI 깨짐 방지 (원본은 raw에 남김)
    reasons = [r for r in reasons if r.strip()]

    return AnalyzeResponse(
        request_id=req_id,
        result=AnalyzeResult(
            label=label,
            score=score,
            reasons=reasons,
            raw=data,
        ),
    )


@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    # ✅ 더미/휴리스틱 금지: 모델 서버 호출이 실패하면 그대로 에러
    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            r = await client.post(
                settings.model_url,
                json={
                    "request_id": req.request_id,
                    "text": req.text,
                    "channel": req.channel,
                },
                headers={"Content-Type": "application/json"},
            )
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"MODEL_SERVER_ERROR: {e}")

    try:
        return _normalize_model_response(data, req.request_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RESPONSE_NORMALIZE_ERROR: {e}")
