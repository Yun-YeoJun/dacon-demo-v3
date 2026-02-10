# Smishing Guard API (FastAPI)

## 1) 설치
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 2) 환경변수 설정 (필수)
모델 서버 엔드포인트를 반드시 지정해야 합니다.

PowerShell:
```powershell
$env:MODEL_URL="https://YOUR_MODEL_SERVER_ENDPOINT"
```

CMD:
```bat
set MODEL_URL=https://YOUR_MODEL_SERVER_ENDPOINT
```

## 3) 실행
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 4) 엔드포인트
- GET /health
- POST /api/v1/analyze  (프론트가 호출)

> 본 API는 **더미/휴리스틱 fallback 없이** MODEL_URL로만 동작합니다.
