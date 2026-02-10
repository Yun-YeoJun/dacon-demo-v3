import { Share2, CheckCircle } from 'lucide-react';
import type { AnalysisData, EvidenceItem } from '../App';

interface SafeAnalysisResultProps {
  onNavigate: (page: 'home' | 'loading' | 'analysis' | 'safeanalysis' | 'mypage' | 
    'search' | 'notification') => void;
  messageText: string;
  analysisData: AnalysisData | null;
}

function fallbackSafeEvidence(): EvidenceItem[] {
  return [
    { title: '의심 링크 없음', description: '외부 링크가 포함되어 있지 않아요' },
    { title: '정상적인 내용', description: '피싱 패턴이 발견되지 않았어요' },
  ];
}

export function SafeAnalysisResult({ onNavigate, messageText, analysisData }: SafeAnalysisResultProps) {
  const evidence = analysisData?.evidence?.length ? analysisData.evidence : fallbackSafeEvidence();
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

      {/* 안전 배너 */}
      <div className="mx-4 mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-8 text-white text-center shadow-lg">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold">안전한 메세지입니다</h2>
      </div>

      {/* 메시지 내용 */}
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
        <div className="space-y-3">
          {evidence.map((item, idx) => (
            <div key={`${item.title}-${idx}`} className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <div className="text-base font-bold mb-1">{item.title}</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 버튼 */}
      <div className="mx-4 mb-6 flex gap-3">
        <button 
          onClick={() => onNavigate('home')}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl text-base font-bold hover:bg-gray-300"
        >
          🏠 홈으로
        </button>
        <button className="flex-1 bg-blue-500 text-white py-4 rounded-2xl text-base font-bold shadow-md hover:bg-blue-600">
          📤 공유하기
        </button>
      </div>
    </div>
  );
}