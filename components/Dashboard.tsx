
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Tuần 1', score: 6.5 },
  { name: 'Tuần 2', score: 7.2 },
  { name: 'Tuần 3', score: 6.8 },
  { name: 'Tuần 4', score: 8.0 },
  { name: 'Tuần 5', score: 8.5 },
  { name: 'Tuần 6', score: 9.2 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-12 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Chào Khang! 👋</h2>
          <p className="text-slate-500 font-medium mt-2 text-lg">Hôm nay chúng ta sẽ chinh phục thêm một đỉnh cao mới nhé.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl">🥇</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạng hiện tại</p>
              <p className="text-sm font-bold text-slate-800">Thủ khoa khối 10</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl transition-all duration-700 group-hover:scale-125"></div>
          <p className="text-blue-100/70 text-[11px] font-black uppercase tracking-widest">Điểm trung bình</p>
          <div className="text-6xl font-black mt-4 tracking-tighter">8.2</div>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-md">
            <span>📈</span> +15% TIẾN BỘ
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Học tập tuần này</p>
          <div className="text-6xl font-black mt-4 text-slate-800 tracking-tighter">12.5 <span className="text-xl font-bold text-slate-300">H</span></div>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 w-fit px-4 py-2 rounded-full">
            <span>🔥</span> CHUỖI 5 NGÀY
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 group">
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Đề thi đã giải</p>
          <div className="text-6xl font-black mt-4 text-slate-800 tracking-tighter">42 <span className="text-xl font-bold text-slate-300">ĐỀ</span></div>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 w-fit px-4 py-2 rounded-full">
            <span>📚</span> DRIVE SYNCED
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Biểu đồ tiến độ</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kết quả 6 tuần</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', fontWeight: '800', fontSize: '12px'}} 
                  cursor={{stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorScore)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Chủ đề ưu tiên</h3>
            <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-xs">⚠️</div>
          </div>
          <div className="space-y-8 flex-1">
            {[
              { label: 'Gerunds & Infinitives', strength: 65, color: 'bg-orange-500' },
              { label: 'Conditional Sentences', strength: 88, color: 'bg-green-500' },
              { label: 'Reported Speech', strength: 72, color: 'bg-blue-600' },
              { label: 'Relative Clauses', strength: 45, color: 'bg-red-500' }
            ].map((topic, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider mb-3">
                  <span className="text-slate-500">{topic.label}</span>
                  <span className={`${topic.strength < 60 ? 'text-red-500' : 'text-slate-400'}`}>{topic.strength}%</span>
                </div>
                <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden p-[2px] shadow-inner">
                  <div 
                    className={`${topic.color} h-full rounded-full transition-all duration-[2s] ease-out`} 
                    style={{ width: `${topic.strength}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-12 w-full py-5 bg-slate-50 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">
            Xem báo cáo tổng quát
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
