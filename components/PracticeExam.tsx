
import React, { useState, useEffect } from 'react';
import { generateFullExam, generateEmailReport } from '../services/geminiService';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
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
      type: "Luyện đề thi Tổng hợp (Full Exam)",
      score: results.score.toFixed(1),
      correctCount: results.correctCount,
      totalCount: questions.length,
      topics: ["Ngữ pháp 10", "Từ vựng Unit", "Đọc hiểu", "Viết câu"]
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
      <h3 className="text-xl font-bold text-slate-800">Thầy đang bốc đề thi cho Khang...</h3>
    </div>
  );

  if (questions.length === 0) return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-[40px] p-12 border shadow-2xl text-center relative overflow-hidden">
        <div className="text-7xl mb-6">🎯</div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Luyện Đề Tổng Hợp</h2>
        <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto">40 câu hỏi chuyên sâu, bám sát cấu trúc Hà Nội. Thầy sẽ chấm điểm và gửi báo cáo cho Mẹ ngay khi Khang nộp bài!</p>
        <button onClick={startTest} className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-200">BẮT ĐẦU LÀM BÀI 🚀</button>
      </div>
    </div>
  );

  const results = submitted ? calculateScore() : null;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="sticky top-4 z-20 bg-white/90 backdrop-blur-md p-5 rounded-[2rem] border shadow-lg flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
            {currentIdx + 1}
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Câu hỏi {currentIdx + 1} / 40</h4>
          </div>
        </div>
        {!submitted ? (
          <button onClick={() => confirm("Nộp bài nhé Khang?") && setSubmitted(true)} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-green-700 shadow-lg">NỘP BÀI ✅</button>
        ) : (
          <button onClick={handleSendReport} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 flex items-center gap-2"><span>📩</span> Báo cáo cho Mẹ</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800 leading-relaxed mb-10">{questions[currentIdx].question}</h3>
            <div className="grid grid-cols-1 gap-4">
              {questions[currentIdx].options.map((opt, i) => (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setAnswers({...answers, [currentIdx]: opt})}
                  className={`p-6 rounded-3xl text-left font-bold border-2 transition-all flex items-center gap-5 ${
                    submitted ? (opt === questions[currentIdx].correctAnswer ? "bg-green-50 border-green-500" : (answers[currentIdx] === opt ? "bg-red-50 border-red-500" : "bg-slate-50")) : (answers[currentIdx] === opt ? "bg-blue-600 text-white" : "bg-slate-50")
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-white border">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center px-4">
            <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)} className="font-bold text-slate-400 hover:text-blue-600">← Câu trước</button>
            <button disabled={currentIdx === 39} onClick={() => setCurrentIdx(prev => prev + 1)} className="font-bold text-slate-400 hover:text-blue-600">Câu tiếp theo →</button>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm sticky top-32">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentIdx(i)} className={`aspect-square rounded-xl text-xs font-black transition-all ${currentIdx === i ? 'bg-blue-600 text-white' : answers[i] ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>{i + 1}</button>
              ))}
            </div>
            {submitted && (
              <div className="mt-8 pt-6 border-t space-y-2">
                <div className="flex justify-between font-bold"><span>Điểm số:</span><span className="text-blue-600">{results?.score.toFixed(1)}</span></div>
                <div className="flex justify-between font-bold"><span>Thời gian:</span><span>{getDuration()}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 text-left">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full p-10 shadow-2xl relative animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">Báo cáo cho Mẹ</h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] border font-medium text-slate-700 leading-relaxed text-sm whitespace-pre-wrap mb-8">
              {emailDraft}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowReport(false)} className="py-4 rounded-2xl border-2 font-black text-slate-600">CHỈNH SỬA</button>
              <button onClick={() => { alert("Đã gửi báo cáo thành công tới lehailinh1984@gmail.com!"); setShowReport(false); }} className="py-4 rounded-2xl bg-blue-600 text-white font-black">XÁC NHẬN GỬI 🚀</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeExam;
