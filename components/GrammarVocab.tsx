
import React, { useState } from 'react';
import { getTopics, getTopicQuestions, generateEmailReport } from '../services/geminiService';

type Mode = 'selection' | 'topics' | 'practice' | 'summary';
type PracticeType = 'grammar' | 'vocab';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const GrammarVocab: React.FC = () => {
  const [mode, setMode] = useState<Mode>('selection');
  const [type, setType] = useState<PracticeType | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');

  const handleSelectType = async (selectedType: PracticeType) => {
    setType(selectedType);
    setLoading(true);
    try {
      const data = await getTopics(selectedType);
      setTopics(data);
      setMode('topics');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);
    try {
      const data = await getTopicQuestions(type!, topic);
      setQuestions(data);
      setCurrentIdx(0);
      setAnswers({});
      setCorrectCount(0);
      setShowFeedback(false);
      setMode('practice');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    const isCorrect = option === questions[currentIdx].correctAnswer;
    if (isCorrect) setCorrectCount(prev => prev + 1);
    setAnswers({ ...answers, [currentIdx]: option });
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowFeedback(false);
    } else {
      setMode('summary');
    }
  };

  const prepareReport = async () => {
    setLoading(true);
    const scoreVal = ((correctCount / questions.length) * 10).toFixed(1);
    const draft = await generateEmailReport({
      type: `${type === 'grammar' ? 'Ngữ pháp' : 'Từ vựng'} - Chủ đề: ${selectedTopic}`,
      score: scoreVal,
      correctCount: correctCount,
      totalCount: questions.length,
      topics: [selectedTopic]
    });
    setEmailDraft(draft);
    setLoading(false);
    setShowReport(true);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h3 className="text-xl font-black text-slate-800 tracking-tight">Thầy đang soạn bài tập cho Khang...</h3>
    </div>
  );

  if (mode === 'selection') return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-4xl font-extrabold text-center mb-16 tracking-tight">Khang muốn luyện tập phần nào? 🧠</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button 
          onClick={() => handleSelectType('grammar')}
          className="bg-white p-12 rounded-[3rem] border-2 border-slate-100 hover:border-blue-600 transition-all text-center shadow-sm group"
        >
          <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📘</div>
          <h3 className="text-2xl font-black mb-2">Ngữ Pháp</h3>
          <p className="text-slate-400 font-medium">Chinh phục 12 thì, câu điều kiện, bị động...</p>
        </button>
        <button 
          onClick={() => handleSelectType('vocab')}
          className="bg-white p-12 rounded-[3rem] border-2 border-slate-100 hover:border-indigo-600 transition-all text-center shadow-sm group"
        >
          <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📙</div>
          <h3 className="text-2xl font-black mb-2">Từ Vựng</h3>
          <p className="text-slate-400 font-medium">Mở rộng vốn từ theo chủ điểm đề thi 10</p>
        </button>
      </div>
    </div>
  );

  if (mode === 'topics') return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <button onClick={() => setMode('selection')} className="mb-8 text-blue-600 font-bold flex items-center gap-2">← Quay lại</button>
      <h2 className="text-3xl font-black mb-10 tracking-tight">Chọn chủ đề {type === 'grammar' ? 'Ngữ pháp' : 'Từ vựng'} 🎯</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic, i) => (
          <button 
            key={i} 
            onClick={() => handleSelectTopic(topic)}
            className="bg-white p-6 rounded-2xl border border-slate-100 text-left font-bold hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );

  if (mode === 'practice') {
    const q = questions[currentIdx];
    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-10">
          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            {selectedTopic}
          </span>
          <span className="font-bold text-slate-400">Câu {currentIdx + 1} / {questions.length}</span>
        </div>
        
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl mb-8">
          <h3 className="text-2xl font-black text-slate-900 mb-10 leading-relaxed">{q.question}</h3>
          <div className="space-y-4">
            {q.options.map((opt, i) => (
              <button 
                key={i} 
                disabled={showFeedback}
                onClick={() => handleAnswer(opt)}
                className={`w-full p-6 rounded-2xl text-left font-bold border-2 transition-all flex items-center gap-5 ${
                  showFeedback 
                    ? (opt === q.correctAnswer ? "bg-green-50 border-green-500 text-green-700" : (answers[currentIdx] === opt ? "bg-red-50 border-red-500 text-red-700" : "bg-slate-50 border-slate-50"))
                    : "bg-slate-50 border-slate-50 hover:bg-blue-50 hover:border-blue-100"
                }`}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs bg-white border">{String.fromCharCode(65+i)}</span>
                {opt}
              </button>
            ))}
          </div>
          
          {showFeedback && (
            <div className="mt-10 p-8 bg-blue-50 rounded-[2rem] border border-blue-100 animate-in slide-in-from-bottom-4">
              <p className="text-blue-900 font-bold leading-relaxed mb-6">{q.explanation}</p>
              <button onClick={handleNext} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-lg">
                {currentIdx < questions.length - 1 ? 'CÂU TIẾP THEO →' : 'XEM KẾT QUẢ 📊'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'summary') {
    const scoreVal = ((correctCount / questions.length) * 10).toFixed(1);
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center">
        <div className="bg-white rounded-[4rem] p-16 border border-slate-100 shadow-2xl">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-10">✨</div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Khang đã hoàn thành!</h2>
          <p className="text-slate-500 font-medium mb-10">Chủ đề: {selectedTopic}</p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="p-8 bg-slate-50 rounded-3xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Điểm số</p>
              <p className="text-4xl font-black text-blue-600">{scoreVal}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-3xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số câu đúng</p>
              <p className="text-2xl font-black text-slate-800">{correctCount}/{questions.length}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={prepareReport} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3">
              <span>📩</span> GỬI KẾT QUẢ CHO MẸ
            </button>
            <button onClick={() => setMode('selection')} className="w-full bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest">LUYỆN TẬP CHỦ ĐỀ KHÁC</button>
          </div>
        </div>

        {showReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] max-w-2xl w-full p-10 shadow-2xl animate-in zoom-in-95 text-left">
              <h2 className="text-2xl font-black mb-6 text-center">Báo cáo gửi cho Mẹ</h2>
              <div className="bg-slate-50 p-8 rounded-[2rem] border font-medium text-slate-700 leading-relaxed text-sm whitespace-pre-wrap mb-8">
                {emailDraft}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowReport(false)} className="flex-1 py-4 rounded-2xl border-2 font-black text-slate-500">ĐÓNG</button>
                <button onClick={() => { alert("Đã gửi báo cáo thành công tới lehailinh1984@gmail.com!"); setShowReport(false); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black">XÁC NHẬN GỬI 🚀</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default GrammarVocab;
