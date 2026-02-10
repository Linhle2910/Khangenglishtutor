
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import PracticeExam from './components/PracticeExam';
import GrammarVocab from './components/GrammarVocab';
import ReadingWriting from './components/ReadingWriting';
import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);

  const menuItems = [
    { id: View.DASHBOARD, label: 'Bảng tin', icon: '📊' },
    { id: View.STUDY, label: 'Gia sư', icon: '👨‍🏫' },
    { id: View.GRAMMAR_VOCAB, label: 'Ngữ pháp', icon: '🧠' },
    { id: View.READING_WRITING, label: 'Đọc Viết', icon: '✍️' },
    { id: View.TEST, label: 'Luyện đề', icon: '📝' },
    { id: View.PROGRESS, label: 'Tiến độ', icon: '📈' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case View.DASHBOARD: return <Dashboard />;
      case View.STUDY: return <ChatInterface />;
      case View.GRAMMAR_VOCAB: return <GrammarVocab />;
      case View.READING_WRITING: return <ReadingWriting />;
      case View.TEST: return <PracticeExam />;
      case View.PROGRESS: return (
        <div className="bg-white p-12 rounded-[3rem] border shadow-sm text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">📈</div>
          <h2 className="text-3xl font-black mb-4">Tiến độ của Khang</h2>
          <p className="text-slate-500 mb-10">Dữ liệu được cập nhật từ kho tài liệu luyện thi Hà Nội.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left font-bold">
            <div className="p-8 bg-slate-50 rounded-3xl border">
              <p className="text-xs uppercase text-slate-400 mb-2 tracking-widest">Ngữ pháp</p>
              <p className="text-2xl text-blue-700">75% Hoàn thành</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-3xl border">
              <p className="text-xs uppercase text-slate-400 mb-2 tracking-widest">Từ vựng</p>
              <p className="text-2xl text-green-700">68% Hoàn thành</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-3xl border">
              <p className="text-xs uppercase text-slate-400 mb-2 tracking-widest">Luyện đề</p>
              <p className="text-2xl text-orange-700">12 Đề đã giải</p>
            </div>
          </div>
        </div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* Sidebar for Desktop */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      
      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto pb-24 md:pb-10">
        {/* Mobile Header (Title only) */}
        <div className="md:hidden flex items-center justify-center mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-xl font-black text-blue-700 flex items-center gap-2">
            <span>🎓</span> Gia Sư Khang
          </h1>
        </div>

        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-2 py-3 z-50 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center justify-center gap-1 min-w-[60px] transition-all duration-300 ${
              activeView === item.id ? 'text-blue-600 scale-110' : 'text-slate-400'
            }`}
          >
            <span className={`text-xl ${activeView === item.id ? 'opacity-100' : 'opacity-60 grayscale'}`}>
              {item.icon}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-tighter ${
              activeView === item.id ? 'opacity-100' : 'opacity-60'
            }`}>
              {item.label}
            </span>
            {activeView === item.id && (
              <span className="w-1 h-1 bg-blue-600 rounded-full mt-0.5 animate-pulse"></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
