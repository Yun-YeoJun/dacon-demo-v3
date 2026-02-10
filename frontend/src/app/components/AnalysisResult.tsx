import { Share2, AlertTriangle } from 'lucide-react';
import type { AnalysisData, EvidenceItem } from '../App';

interface AnalysisResultProps {
  onNavigate: (page: 'home' | 'loading' | 'analysis' | 'safeanalysis' | 'mypage' | 
    'search' | 'notification') => void;
  messageText: string;
  analysisData: AnalysisData | null;
}

const COLOR_PRESETS = [
  { bg: 'bg-red-50', dot: 'bg-red-500', icon: '!' },
  { bg: 'bg-orange-50', dot: 'bg-orange-500', icon: '!' },
  { bg: 'bg-yellow-50', dot: 'bg-yellow-500', icon: '!' },
];

function formatRawEvidence(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) {
    return v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n');
  }
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function AnalysisResult({ onNavigate, messageText, analysisData }: AnalysisResultProps) {
  const evidence = analysisData?.evidence ?? [];
  const rawText = formatRawEvidence(analysisData?.evidence_raw);
  const rawJson = analysisData?.raw ? JSON.stringify(analysisData.raw, null, 2) : '';
  return (
    <div className="h-full overflow-y-auto pb-24 pt-8">
      {/* 헤더 */}
      <div className="px-4 py-4 border-b flex items-center gap-3">
        <button 
          onClick={() => onNavigate('home')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold flex-1">분석 결과</h1>
      </div>

      {/* 경고 배너 */}
      <div className="mx-4 mb-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-3xl p-8 text-white text-center shadow-lg">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold">위험한 메시지입니다!</h2>
      </div>

      {/* 분석 내용 */}
      <div className="mx-4 mb-6">
        <h3 className="text-lg font-bold mb-3">메시지 내용</h3>
        <div className="bg-gray-50 rounded-2xl p-5">
          <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
            {messageText || '분석할 메시지가 없습니다.'}
          </p>
        </div>
      </div>

      {/* AI 분석 결과 */}
      <div className="mx-4 mb-6">
        <h3 className="text-lg font-bold mb-3">AI 분석 결과</h3>
        {evidence.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-600">
            LLM 근거를 불러오지 못했습니다. 아래의 “원문/응답 확인”에서 실제 응답을 확인해 주세요.
          </div>
        ) : (
          <div className="space-y-3">
            {evidence.map((item, idx) => {
            const preset = COLOR_PRESETS[idx % COLOR_PRESETS.length];
            return (
              <div key={`${item.title}-${idx}`} className={`flex items-start gap-3 ${preset.bg} rounded-xl p-4`}>
                <div className={`w-6 h-6 ${preset.dot} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className="text-white text-sm">{preset.icon}</span>
                </div>
                <div>
                  <div className="text-base font-bold mb-1">{item.title}</div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{item.description}</div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* 원문/응답 확인 */}
      <div className="mx-4 mb-10">
        <h3 className="text-lg font-bold mb-3">원문/응답 확인</h3>
        <div className="space-y-3">
          <details className="bg-gray-50 rounded-2xl p-5" open>
            <summary className="cursor-pointer text-sm font-semibold text-gray-800">LLM 근거 원문(가공 전)</summary>
            <pre className="mt-3 text-xs text-gray-700 whitespace-pre-wrap break-words">
              {rawText || '원문 근거가 없습니다.'}
            </pre>
          </details>
          <details className="bg-gray-50 rounded-2xl p-5">
            <summary className="cursor-pointer text-sm font-semibold text-gray-800">전체 API 응답(JSON)</summary>
            <pre className="mt-3 text-xs text-gray-700 whitespace-pre-wrap break-words">
              {rawJson || '응답이 없습니다.'}
            </pre>
          </details>
        </div>
      </div>

      {/* 버튼 */}
      <div className="mx-4 mb-6 flex gap-3">
        <button 
          onClick={() => window.open('https://ecrm.police.go.kr/minwon/main', '_blank')}
          className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-base font-bold shadow-md hover:bg-red-600"
        >
          🚨 신고하기
        </button>
        <button className="flex-1 bg-blue-500 text-white py-4 rounded-2xl text-base font-bold shadow-md hover:bg-blue-600">
          📤 공유하기
        </button>
      </div>
    </div>
  );
}