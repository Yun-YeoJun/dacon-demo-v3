import { useEffect } from 'react';
import type { AnalysisData, EvidenceItem } from '../App';

interface LoadingProps {
  onNavigate: (page: 'home' | 'loading' | 'analysis' | 'safeanalysis' | 'mypage' | 
    'search' | 'notification') => void;
  analysisText: string;
  onResult: (data: AnalysisData) => void;
}

function parseEvidencePairs(lines: string[]): EvidenceItem[] {
  const cleaned = lines
    .map((l) => l.replace(/^[\s\-•*]+/, '').trim())
    .filter((l) => l.length > 0);

  const items: EvidenceItem[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    const title = cleaned[i] ?? '';
    const description = cleaned[i + 1] ?? '';
    if (title) items.push({ title, description });
  }
  return items;
}

function normalizeAnalysisResponse(payload: any): AnalysisData {
  // Accept both {result:{...}} and flat shapes
  const root = payload?.result ?? payload ?? {};
  const label = root?.label ?? root?.prediction ?? payload?.label;
  const confidence = typeof root?.confidence === 'number' ? root.confidence : payload?.confidence;

  // Candidate evidence sources
  const candidates = [
    // 백엔드가 원본(model server/LLM) 응답을 result.raw에 그대로 넣는 경우를 우선 사용
    root?.raw?.evidence,
    root?.raw?.reasons,
    root?.raw?.reason,
    root?.raw?.rationale,
    root?.raw?.justification,
    root?.raw?.explanation,
    root?.raw?.supporting_facts,
    root?.raw?.result?.evidence,
    root?.raw?.result?.reasons,
    root?.evidence,
    root?.reasons,
    root?.reason,
    root?.rationale,
    root?.justification,
    root?.explanation,
    root?.supporting_facts,
    root?.llm?.evidence,
    root?.llm?.reasons,
  ];

  let evidence: EvidenceItem[] | undefined;
  let evidence_raw: unknown = undefined;

  for (const c of candidates) {
    if (!c) continue;

    // If already in {title, description}[] format
    if (Array.isArray(c) && c.length > 0 && typeof c[0] === 'object' && 'title' in c[0]) {
      evidence = (c as any[]).map((x) => ({
        title: String((x as any).title ?? ''),
        description: String((x as any).description ?? ''),
      })).filter((x) => x.title.length > 0);
      evidence_raw = c;
      break;
    }

    // If evidence is a string (multi-line)
    if (typeof c === 'string') {
      const lines = c.split(/\r?\n/);
      const parsed = parseEvidencePairs(lines);
      if (parsed.length > 0) {
        evidence = parsed;
        evidence_raw = c;
        break;
      }
    }

    // If evidence is string[]
    if (Array.isArray(c) && c.every((x) => typeof x === 'string')) {
      // Some backends return ["title\ndesc", ...]
      const lines: string[] = [];
      for (const s of c as string[]) {
        lines.push(...String(s).split(/\r?\n/));
      }
      const parsed = parseEvidencePairs(lines);
      if (parsed.length > 0) {
        evidence = parsed;
        evidence_raw = c;
        break;
      }
    }
  }

  return { label, confidence, evidence, evidence_raw, raw: payload };
}

export function Loading({ onNavigate, analysisText, onResult }: LoadingProps) {
  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      try {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:8000';
        const res = await fetch(`${API_BASE}/api/v1/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: analysisText }),
          signal: controller.signal,
        });

        const json = await res.json().catch(() => ({}));
        const data = normalizeAnalysisResponse(json);
        onResult(data);

        const isDangerous = String(data.label ?? '').toLowerCase().includes('smish') || String(data.label ?? '').includes('위험');
        onNavigate(isDangerous ? 'analysis' : 'safeanalysis');
      } catch (e) {
        // API 호출 실패 시: 가짜 근거/가짜 판정은 만들지 않는다.
        onResult({ label: 'unknown', confidence: undefined, evidence: undefined, evidence_raw: undefined, raw: { error: String(e) } });
        // 결과 화면은 사용자가 원문/에러를 확인할 수 있도록 분석 페이지로 보낸다.
        onNavigate('analysis');
      }
    };

    // Small delay to show animation (UX)
    const timer = setTimeout(run, 800);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [onNavigate, analysisText, onResult]);

  return (
    <div className="h-full overflow-y-auto pb-24 pt-8 px-4">
      <div className="flex flex-col items-center justify-center min-h-full">
        {/* 로딩 애니메이션 */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-6xl">🔍</div>
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <h1 className="text-2xl font-bold mb-2">분석 중입니다</h1>
        <p className="text-base text-gray-500 mb-8">메세지를 분석하고 있습니다...</p>

        {/* 로딩 바 */}
        <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-[loading_2s_ease-in-out]" 
               style={{ animation: 'loading 2s ease-out forwards' }} />
        </div>

        <style>{`
          @keyframes loading {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}