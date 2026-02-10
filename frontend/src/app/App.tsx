import { useState } from 'react';
import { Home } from './components/Home';
import { Loading } from './components/Loading';
import { AnalysisResult } from './components/AnalysisResult';
import { SafeAnalysisResult } from './components/SafeAnalysisResult';
import { MyPage } from './components/MyPage';
import { Search } from './components/Search';
import { Notification } from './components/Notification';

export type EvidenceItem = { title: string; description: string };

export type AnalysisData = {
  label?: string;
  confidence?: number;
  evidence?: EvidenceItem[];
  /** LLM 근거 원문(가공 전). 문자열/배열/객체 모두 가능 */
  evidence_raw?: unknown;
  // raw payload for debugging / future use
  raw?: unknown;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    'home' | 'loading' | 'analysis' | 'safeanalysis' | 'mypage' | 
    'search' | 'notification'
  >('home');
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [analysisText, setAnalysisText] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const handleAnalyze = (text: string) => {
    setAnalysisText(text);
    setAnalysisData(null);
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-100">
      {/*
        NOTE:
        - 하단 네비게이션은 항상 뷰포트 최하단에 고정(fixed)
        - 콘텐츠가 네비게이션에 가리지 않도록 컨테이너에 padding-bottom을 준다
      */}
      <div className="w-full max-w-md min-h-screen bg-white relative pb-[88px]">
        {/* 페이지 컨텐츠 */}
        <div className="min-h-screen">
          {currentPage === 'home' && <Home onNavigate={setCurrentPage} onAnalyze={handleAnalyze} />}
          {currentPage === 'loading' && (
            <Loading
              onNavigate={setCurrentPage}
              analysisText={analysisText}
              onResult={(data) => setAnalysisData(data)}
            />
          )}
          {currentPage === 'analysis' && (
            <AnalysisResult
              onNavigate={setCurrentPage}
              messageText={analysisText}
              analysisData={analysisData}
            />
          )}
          {currentPage === 'safeanalysis' && (
            <SafeAnalysisResult
              onNavigate={setCurrentPage}
              messageText={analysisText}
              analysisData={analysisData}
            />
          )}
          {currentPage === 'mypage' && <MyPage onNavigate={setCurrentPage} />}
          {currentPage === 'search' && <Search onNavigate={setCurrentPage} />}
          {currentPage === 'notification' && <Notification onNavigate={setCurrentPage} unreadCount={unreadNotifications} setUnreadCount={setUnreadNotifications} />}
        </div>
        
        {/* 하단 네비게이션 바 */}
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex justify-around items-center h-16">
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('search')}>
              <div className={`w-6 h-6 ${currentPage === 'search' ? 'text-blue-500' : 'text-gray-400'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </button>
            <button className="flex flex-col items-center gap-1" onClick={() => setCurrentPage('home')}>
              <div className={`w-6 h-6 ${currentPage === 'home' ? 'text-blue-500' : 'text-gray-400'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
            </button>
            <button className="flex flex-col items-center gap-1 relative" onClick={() => setCurrentPage('notification')}>
              <div className={`w-6 h-6 ${currentPage === 'notification' ? 'text-blue-500' : 'text-gray-400'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              {unreadNotifications > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{unreadNotifications}</span>
                </div>
              )}
            </button>
          </div>
          {/* iOS 홈 인디케이터 영역 */}
          <div className="h-4 bg-white" />
        </div>
      </div>
    </div>
  );
}