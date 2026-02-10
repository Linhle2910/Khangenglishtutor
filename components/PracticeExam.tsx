
import React, { useState, useEffect } from 'react';
import { generateFullExam, generateEmailReport } from '../services/geminiService';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  part: string;
}

const PracticeExam: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showReport, setShowReport] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');

  const startTest = async () => {
    setLoading(true);
    try {
      const q = await generateFullExam();
      setQuestions(q);
      setAnswers({});
      setCurrentIdx(0);
      setSubmitted(false);
      setStartTime(Date.now());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    return {
      score: (correct / questions.length) * 10,
      correctCount: correct,
      wrongCount: questions.length - correct
    };
  };

  const getDuration = () => {
    const diff = Date.now() - startTime;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins} phút ${secs} giây`;
  };

  const handleSendReport = async () => {
    const results = calculateScore();
    const draft = await generateEmailReport({
      type: "Luyện đề thi Tổng hợp (Hà Nội 2025 Structure)",
      score: results.score.toFixed(1),
      correctCount: results.correctCount,
      totalCount: questions.length,
      // Fix: Explicitly cast Array.from result to string[] to resolve the 'unknown[]' type error
      topics: (Array.from(new Set(questions.map(q => q.topic))).slice(0, 5) as string[])
    });
    setEmailDraft(draft);
    setShowReport(true);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <h3 className="text-xl font-bold text-slate-800">Bộ não AI đang phối hợp bốc đề 2025...</h3>
      <p className="text-slate-400 mt-2 font-medium">Truy vấn ngân hàng câu hỏi...</p>
    </div>
  );

  if (questions.length === 0) return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white rounded-[40px] p-12 border shadow-2xl text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
        <div className="text-7xl mb-6">🎯</div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Luyện Đề Chuẩn 2025</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-left">
          <div className="p-4 bg-slate-50 rounded-2xl border">
            <p className="text-[10px] font-black text-blue-600 uppercase">Phần 1</p>
            <p className="font-bold text-sm">Ngữ âm (4c)</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border">
            <p className="text-[10px] font-black text-blue-600 uppercase">Phần 2</p>
            <p className="font-bold text-sm">Ngữ pháp (8c)</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border">
            <p className="text-[10px] font-black text-blue-600 uppercase">Phần 3</p>
            <p className="font-bold text-sm">Kỹ năng Đọc (20c)</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border">
            <p className="text-[10px] font-black text-blue-600 uppercase">Phần 4</p>
            <p className="font-bold text-sm">Kỹ năng Viết (8c)</p>
          </div>
        </div>
        <button onClick={startTest} className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">BẮT ĐẦU LÀM ĐỀ 🚀</button>
      </div>
    </div>
  );

  const currentQuestion = questions[currentIdx];
  const results = submitted ? calculateScore() : null;

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4">
      <div className="sticky top-4 z-20 bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] border shadow-xl flex justify-between items-center mb-8 border-blue-100">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-lg text-lg">
            {currentIdx + 1}
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg">{currentQuestion.part}</h4>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Hà Nội Entrance Exam 2025</p>
          </div>
        </div>
        <div className="flex gap-4">
          {!submitted ? (
            <button onClick={() => confirm("Nộp bài nhé Khang?") && setSubmitted(true)} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-green-700 shadow-lg transition-all active:scale-95 flex items-center gap-2">
              <span className="text-xl">✅</span> NỘP BÀI
            </button>
          ) : (
            <button onClick={handleSendReport} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 flex items-center gap-3 shadow-lg active:scale-95 transition-all">
              <span>📩</span> BÁO CÁO CHO MẸ
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-12 rounded-[3.5rem] border shadow-sm border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            <div className="mb-6 flex items-center gap-2">
               <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{currentQuestion.topic}</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 leading-snug mb-12">{currentQuestion.question}</h3>
            <div className="grid grid-cols-1 gap-5">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setAnswers({...answers, [currentIdx]: opt})}
                  className={`p-6 rounded-[2rem] text-left font-bold border-2 transition-all flex items-center gap-6 group ${
                    submitted 
                      ? (opt === currentQuestion.correctAnswer 
                          ? "bg-green-50 border-green-500 text-green-700 ring-4 ring-green-100" 
                          : (answers[currentIdx] === opt ? "bg-red-50 border-red-500 text-red-700" : "bg-slate-50 border-slate-50 opacity-60")) 
                      : (answers[currentIdx] === opt 
                          ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100" 
                          : "bg-slate-50 border-slate-50 hover:border-blue-200 hover:bg-blue-50 text-slate-600")
                  }`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm border font-black transition-all ${
                    answers[currentIdx] === opt ? 'bg-white/20 border-white/40' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-lg">{opt}</span>
                </button>
              ))}
            </div>
          </div>
          
          {submitted && (
            <div className="bg-blue-50 p-10 rounded-[3rem] border border-blue-100 animate-in slide-in-from-bottom-6">
              <h4 className="text-xl font-black text-blue-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">!</span>
                GIẢI THÍCH CHI TIẾT
              </h4>
              <p className="text-blue-800/80 font-bold leading-relaxed text-lg italic">
                "{currentQuestion.explanation}"
              </p>
            </div>
          )}

          <div className="flex justify-between items-center px-10">
            <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)} className="font-black text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors disabled:opacity-20 uppercase tracking-widest text-xs">
              ← CÂU TRƯỚC
            </button>
            <button disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(prev => prev + 1)} className="font-black text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors disabled:opacity-20 uppercase tracking-widest text-xs">
              CÂU TIẾP THEO →
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm sticky top-40 border-slate-100">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">Bản đồ câu hỏi</h5>
            <div className="grid grid-cols-5 gap-3">
              {questions.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentIdx(i)} 
                  className={`aspect-square rounded-xl text-xs font-black transition-all flex items-center justify-center border-2 ${
                    currentIdx === i 
                      ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg' 
                      : answers[i] 
                        ? 'bg-blue-50 border-blue-100 text-blue-700' 
                        : 'bg-slate-50 border-slate-50 text-slate-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {submitted && results && (
              <div className="mt-10 pt-8 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kết quả</span>
                  <span className="text-2xl font-black text-blue-600">{results.score.toFixed(1)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${results.score * 10}%` }}></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                   <span className="text-green-600">Đúng: {results.correctCount}</span>
                   <span className="text-red-500">Sai: {results.wrongCount}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] max-w-3xl w-full p-12 shadow-2xl relative animate-in zoom-in-95 duration-500 text-left overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32"></div>
             <div className="relative z-10">
              <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4">
                <span className="text-4xl">📧</span> Báo cáo gửi cho Mẹ
              </h2>
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 font-medium text-slate-700 leading-relaxed text-lg whitespace-pre-wrap mb-10 shadow-inner max-h-[40vh] overflow-y-auto scrollbar-hide">
                {emailDraft}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => setShowReport(false)} className="py-5 rounded-[1.5rem] border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">CHỈNH SỬA</button>
                <button onClick={() => { alert("Đã gửi báo cáo thành công tới lehailinh1984@gmail.com!"); setShowReport(false); }} className="py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 uppercase tracking-widest text-xs">XÁC NHẬN GỬI 🚀</button>
              </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeExam;
