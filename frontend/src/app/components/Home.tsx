import { useState } from 'react';

interface HomeProps {
  onNavigate: (page: 'home' | 'loading' | 'analysis' | 'safeanalysis' | 'mypage' | 
    'search' | 'notification') => void;
  onAnalyze: (text: string) => void;
}

export function Home({ onNavigate, onAnalyze }: HomeProps) {
  const [inputText, setInputText] = useState('');

  const handleAnalyze = () => {
    if (inputText.trim()) {
      onAnalyze(inputText);
      onNavigate('loading');
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-24 pt-8">
      {/* 메인 배너 */}
      <div className="mx-4 mt-6 mb-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">지금 받은 그 메세지,<br />안전할까요?</h1>
          </div>
          <div className="text-7xl ml-4">🛡️</div>
        </div>
      </div>

      {/* 문자 입력 영역 */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold mb-3">문자 내용을 붙여넣으세요</h2>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="의심스러운 문자 내용을 여기에 붙여넣으세요..."
          className="w-full h-48 p-4 bg-gray-50 rounded-2xl text-base border-2 border-gray-200 focus:border-blue-500 outline-none resize-none"
        />
        
        {/* 분석 버튼 */}
        <button
          onClick={handleAnalyze}
          disabled={!inputText.trim()}
          className={`w-full mt-4 py-5 rounded-2xl text-xl font-bold transition-all ${
            inputText.trim()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          🔍 분석하기
        </button>
      </div>

      {/* 최근 분석 기록 */}
      <div className="px-4">
        <h2 className="text-lg font-bold mb-3">최근 분석 기록</h2>
        <button 
          onClick={() => onNavigate('analysis')}
          className="w-full bg-red-50 rounded-xl p-4 flex items-center gap-3 mb-3"
        >
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div className="flex-1 text-left">
            <div className="text-base font-bold mb-1">위험 메세지</div>
            <div className="text-sm text-gray-500">택배 배송 확인 링크...</div>
          </div>
        </button>
        <button 
          onClick={() => onNavigate('safeanalysis')}
          className="w-full bg-green-50 rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
            ✅
          </div>
          <div className="flex-1 text-left">
            <div className="text-base font-bold mb-1">안전한 메세지</div>
            <div className="text-sm text-gray-500">회의 일정 안내...</div>
          </div>
        </button>
      </div>
    </div>
  );
}