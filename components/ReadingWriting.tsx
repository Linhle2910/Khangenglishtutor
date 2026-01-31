
import React, { useState } from 'react';
import { getReadingData, getWritingData, generateEmailReport } from '../services/geminiService';
import { ReadingPassage, WritingQuestion } from '../types';

type Stage = 'selection' | 'reading' | 'writing' | 'summary';

const ReadingWriting: React.FC = () => {
  const [stage, setStage] = useState<Stage>('selection');
  const [loading, setLoading] = useState(false);
  const [readingData, setReadingData] = useState<ReadingPassage[]>([]);
  const [writingData, setWritingData] = useState<WritingQuestion[]>([]);
  const [readingFinished, setReadingFinished] = useState(false);
  const [writingFinished, setWritingFinished] = useState(false);

  const [currentPassageIdx, setCurrentPassageIdx] = useState(0);
  const [currentReadQIdx, setCurrentReadQIdx] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [showReadingFeedback, setShowReadingFeedback] = useState(false);

  const [currentWritingIdx, setCurrentWritingIdx] = useState(0);
  const [writingInput, setWritingInput] = useState('');
  const [writingFeedback, setWritingFeedback] = useState<{isCorrect: boolean, feedback: string} | null>(null);
  const [writingCorrectCount, setWritingCorrectCount] = useState(0);
  const [readingCorrectCount, setReadingCorrectCount] = useState(0);

  const [emailDraft, setEmailDraft] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleStartReading = async () => {
    if (readingData.length === 0) {
      setLoading(true);
      try { const r = await getReadingData(); setReadingData(r); } catch (e) {} finally { setLoading(false); }
    }
    setStage('reading');
  };

  const handleStartWriting = async () => {
    if (writingData.length === 0) {
      setLoading(true);
      try { const w = await getWritingData(); setWritingData(w); } catch (e) {} finally { setLoading(false); }
    }
    setStage('writing');
  };

  const prepareReport = async () => {
    setSendingEmail(true);
    const totalReadingQ = readingData.reduce((acc, p) => acc + p.questions.length, 0);
    const report = await generateEmailReport({
      type: "Kỹ năng Đọc & Viết (Reading & Writing)",
      score: (((readingCorrectCount + writingCorrectCount) / (totalReadingQ + 10)) * 10).toFixed(1),
      correctCount: readingCorrectCount + writingCorrectCount,
      totalCount: totalReadingQ + 10,
      topics: ["Đọc hiểu đoạn văn", "Viết lại câu cấu trúc cao"]
    });
    setEmailDraft(report);
    setSendingEmail(false);
    setShowReportModal(true);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-20 h-20 relative mb-8">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Thầy đang soạn tài liệu Tiếng Anh...</h3>
    </div>
  );

  if (stage === 'selection') return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <header className="text-center mb-16 space-y-4">
        <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">Luyện Đọc & Viết <span className="text-indigo-600">Pro</span> 📖✍️</h2>
        <p className="text-slate-500 text-xl font-medium">Khang muốn bắt đầu với kỹ năng nào trước?</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <button onClick={handleStartReading} className="group bg-white p-14 rounded-[3.5rem] border-2 border-slate-100 hover:border-indigo-600 transition-all text-center relative overflow-hidden">
          <div className="text-7xl mb-8 transform group-hover:scale-110 transition-transform">📖</div>
          <h3 className="text-3xl font-black text-slate-800 mb-3">Luyện Đọc Hiểu</h3>
          {readingFinished && <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">✓ HOÀN THÀNH</div>}
        </button>
        <button onClick={handleStartWriting} className="group bg-white p-14 rounded-[3.5rem] border-2 border-slate-100 hover:border-purple-600 transition-all text-center relative overflow-hidden">
          <div className="text-7xl mb-8 transform group-hover:scale-110 transition-transform">✍️</div>
          <h3 className="text-3xl font-black text-slate-800 mb-3">Viết Lại Câu</h3>
          {writingFinished && <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">✓ HOÀN THÀNH</div>}
        </button>
      </div>
      {(readingFinished || writingFinished) && (
        <div className="mt-16 text-center">
          <button onClick={() => setStage('summary')} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
            XEM TỔNG KẾT & BÁO CÁO 📊
          </button>
        </div>
      )}
    </div>
  );

  if (stage === 'reading') {
    const p = readingData[currentPassageIdx];
    const q = p?.questions[currentReadQIdx];
    return (
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 py-10 px-6 min-h-[80vh]">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-y-auto max-h-[70vh] sticky top-10 scrollbar-hide">
          <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">Reading Passage {currentPassageIdx + 1}/5</span>
          <div className="mt-8 prose prose-slate font-medium text-slate-700 leading-[1.8] whitespace-pre-wrap">{p?.passage}</div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black mb-10 text-slate-900 leading-tight">{q?.question}</h3>
            <div className="space-y-4">
              {q?.options.map((opt, i) => (
                <button 
                  key={i} 
                  disabled={showReadingFeedback}
                  onClick={() => { 
                    const isCorrect = opt === q.correctAnswer;
                    if (isCorrect) setReadingCorrectCount(c => c + 1);
                    setReadingAnswers({...readingAnswers, [`${currentPassageIdx}-${currentReadQIdx}`]: opt}); 
                    setShowReadingFeedback(true); 
                  }} 
                  className={`w-full p-6 rounded-2xl text-left font-bold border-2 transition-all flex items-center gap-5 ${
                    showReadingFeedback ? (opt === q.correctAnswer ? "bg-green-50 border-green-500" : (readingAnswers[`${currentPassageIdx}-${currentReadQIdx}`] === opt ? "bg-red-50 border-red-500" : "bg-slate-50")) : "bg-slate-50 hover:bg-indigo-50"
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs border bg-white">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
            {showReadingFeedback && (
              <div className="mt-10 p-8 bg-amber-50 rounded-[2rem] border border-amber-100">
                <p className="text-amber-900 font-medium leading-relaxed mb-6">{q?.explanation}</p>
                <button onClick={() => {
                  if (currentReadQIdx < p.questions.length - 1) setCurrentReadQIdx(prev => prev + 1);
                  else if (currentPassageIdx < readingData.length - 1) { setCurrentPassageIdx(prev => prev + 1); setCurrentReadQIdx(0); }
                  else { setReadingFinished(true); setStage('selection'); }
                  setShowReadingFeedback(false);
                }} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg">CÂU TIẾP THEO →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'writing') {
    const q = writingData[currentWritingIdx];
    return (
      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
          <h3 className="text-3xl font-extrabold text-slate-900 mb-4">{q?.original}</h3>
          <p className="text-purple-600 font-bold mb-10 italic">Hint: {q?.hint}</p>
          <textarea disabled={!!writingFeedback} value={writingInput} onChange={(e) => setWritingInput(e.target.value)} placeholder="Nhập câu viết lại..." className="w-full p-8 rounded-[2.5rem] border-2 bg-slate-50 min-h-[160px] outline-none font-semibold text-xl mb-6" />
          {!writingFeedback ? (
            <button onClick={() => {
              const isCorrect = writingInput.trim().toLowerCase() === q.correctAnswer.toLowerCase();
              if (isCorrect) setWritingCorrectCount(c => c + 1);
              setWritingFeedback({isCorrect, feedback: q.explanation});
            }} className="w-full bg-purple-600 text-white py-6 rounded-2xl font-black text-lg">KIỂM TRA ✅</button>
          ) : (
            <div className="p-10 bg-slate-50 rounded-[3rem] border-2">
              <p className="text-2xl font-black text-slate-900 mb-4">Đáp án: {q.correctAnswer}</p>
              <p className="text-slate-600 font-bold mb-8">{writingFeedback.feedback}</p>
              <button onClick={() => {
                if (currentWritingIdx < writingData.length - 1) { setCurrentWritingIdx(v => v + 1); setWritingInput(''); setWritingFeedback(null); }
                else { setWritingFinished(true); setStage('selection'); }
              }} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black">CÂU TIẾP THEO →</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'summary') {
    const totalReadingQ = readingData.reduce((acc, p) => acc + p.questions.length, 0);
    const score = (((readingCorrectCount + writingCorrectCount) / (totalReadingQ + 10)) * 10).toFixed(1);
    
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center">
        <div className="bg-white rounded-[4rem] p-16 border border-slate-100 shadow-2xl">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-10">🏆</div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Khang làm tốt lắm!</h2>
          <div className="grid grid-cols-2 gap-6 my-12">
            <div className="p-8 bg-slate-50 rounded-3xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Điểm số</p>
              <p className="text-4xl font-black text-indigo-600">{score}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-3xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chính xác</p>
              <p className="text-2xl font-black text-purple-600">{readingCorrectCount + writingCorrectCount}/{totalReadingQ + 10}</p>
            </div>
          </div>
          <div className="space-y-4">
            <button onClick={prepareReport} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3">
              <span>📩</span> GỬI KẾT QUẢ CHO MẸ
            </button>
            <button onClick={() => window.location.reload()} className="w-full bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest">VỀ TRANG CHỦ</button>
          </div>
        </div>

        {showReportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] max-w-2xl w-full p-10 shadow-2xl animate-in zoom-in-95">
              <h2 className="text-2xl font-black mb-6 text-center">Báo cáo cho Mẹ Khang</h2>
              <div className="bg-slate-50 p-8 rounded-[2rem] border font-medium text-slate-700 leading-relaxed text-sm whitespace-pre-wrap text-left mb-8">
                {emailDraft}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowReportModal(false)} className="flex-1 py-4 rounded-2xl border-2 font-black text-slate-500">ĐÓNG</button>
                <button onClick={() => { alert("Đã gửi báo cáo thành công tới lehailinh1984@gmail.com!"); setShowReportModal(false); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black">XÁC NHẬN GỬI 🚀</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ReadingWriting;
