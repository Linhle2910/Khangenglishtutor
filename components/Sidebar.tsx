
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Bảng điều khiển', icon: '📊' },
    { id: View.STUDY, label: 'Gia sư AI', icon: '👨‍🏫' },
    { id: View.GRAMMAR_VOCAB, label: 'Ngữ pháp & Từ vựng', icon: '🧠' },
    { id: View.READING_WRITING, label: 'Đọc và Viết', icon: '✍️' },
    { id: View.TEST, label: 'Luyện đề thi', icon: '📝' },
    { id: View.PROGRESS, label: 'Báo cáo tiến độ', icon: '📈' },
  ];

  return (
    <aside className="w-80 bg-white border-r h-screen sticky top-0 hidden md:flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-10 border-b border-slate-50">
        <button 
          onClick={() => onNavigate(View.DASHBOARD)}
          className="flex items-center gap-3 group text-left transition-transform active:scale-95"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">🎓</div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
            Gia Sư <span className="text-blue-600 group-hover:text-blue-700">Khang</span>
          </h1>
        </button>
        <div className="mt-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hanoi Grade 10 Specialist</span>
        </div>
      </div>
      
      <nav className="flex-1 p-6 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative ${
              activeView === item.id
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
            }`}
          >
            <span className={`text-xl transition-all duration-300 ${activeView === item.id ? 'scale-110 drop-shadow-md' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'}`}>
              {item.icon}
            </span>
            <span className={`font-bold text-sm tracking-tight ${activeView === item.id ? 'translate-x-1' : ''} transition-transform`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-slate-50">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
          <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-tighter">
            <span>Tiến độ mục tiêu</span>
            <span className="text-blue-600">75%</span>
          </div>
          <div className="w-full bg-white h-2 rounded-full overflow-hidden p-[2px] shadow-sm">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.2)]" 
              style={{ width: '75%' }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 text-center font-bold italic leading-relaxed">
            "Hành trình vạn dặm bắt đầu từ một bước chân."
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
