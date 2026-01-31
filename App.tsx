
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
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto">
        <div className="md:hidden flex items-center justify-between mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-xl font-black text-blue-700 flex items-center gap-2"><span>🎓</span> Khang</h1>
          <select value={activeView} onChange={(e) => setActiveView(e.target.value as View)} className="p-2 rounded-xl text-xs font-black bg-slate-50 outline-none ring-2 ring-slate-100">
            <option value={View.DASHBOARD}>📊 Bảng điều khiển</option>
            <option value={View.STUDY}>👨‍🏫 Gia sư AI</option>
            <option value={View.GRAMMAR_VOCAB}>🧠 Ngữ pháp & Từ vựng</option>
            <option value={View.READING_WRITING}>✍️ Đọc và Viết</option>
            <option value={View.TEST}>📝 Luyện đề thi</option>
            <option value={View.PROGRESS}>📈 Tiến độ</option>
          </select>
        </div>
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
