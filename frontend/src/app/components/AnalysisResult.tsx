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

function fallbackDangerEvidence(): EvidenceItem[] {
  return [
    { title: '의심스러운 링크 포함', description: '공식 사이트가 아닌 링크가 포함되어 있어요' },
    { title: '긴급성 유도', description: '24시간 제한 등으로 긴급성을 조장해요' },
    { title: '금전 관련 내용', description: '환급, 세금 등 금전적 이득을 언급하고 있어요' },
  ];
}

export function AnalysisResult({ onNavigate, messageText, analysisData }: AnalysisResultProps) {
  const evidence = analysisData?.evidence?.length ? analysisData.evidence : fallbackDangerEvidence();
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