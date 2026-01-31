
import React, { useState, useRef, useEffect } from 'react';
import { getTutorResponse } from '../services/geminiService';
import { Message } from '../types';

interface Attachment {
  data: string;
  mimeType: string;
  previewUrl: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Chào Khang! Thầy đã sẵn sàng đồng hành cùng em. Khang có thể chụp ảnh bài tập trong sách hoặc nhấn giữ nút Mic để hỏi thầy nhé! 👋', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading, attachments]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachments(prev => [...prev, {
          data: base64String,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file)
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          handleSend("Gửi Khang đoạn ghi âm câu hỏi.", [{ data: base64String, mimeType: 'audio/webm', previewUrl: '' }]);
        };
        reader.readAsDataURL(audioBlob);
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Khang hãy cho phép sử dụng Micro nhé!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleSend = async (customText?: string, customAttachments?: Attachment[]) => {
    const textToSend = customText || input;
    const attsToSend = customAttachments || attachments;
    if (!textToSend.trim() && attsToSend.length === 0) return;

    const userMsg: Message = { role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getTutorResponse(textToSend, history, attsToSend.map(a => ({ data: a.data, mimeType: a.mimeType })));
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative">
      <div className="bg-white border-b border-slate-50 p-6 flex items-center justify-between z-10 px-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl shadow-xl shadow-blue-100">👨‍🏫</div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Gia Sư AI Đa Năng</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
              Luyện thi 10 Hà Nội • Online
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-3">
           <div className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-slate-100 uppercase tracking-widest">Multimedia Support</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-[#FAFBFE] scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[75%] p-6 rounded-[2.2rem] shadow-sm relative ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100 font-medium' 
                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 leading-relaxed font-medium'
            }`}>
              <p className="whitespace-pre-wrap text-[15px]">{m.text}</p>
              <div className={`text-[9px] mt-4 font-black uppercase tracking-widest opacity-40 ${m.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-6 py-4 bg-white rounded-[1.5rem] border border-slate-100 flex items-center gap-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Thầy đang soạn câu trả lời...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-slate-50 bg-white z-10">
        {attachments.length > 0 && (
          <div className="flex gap-4 mb-6 p-5 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-in zoom-in-95">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group">
                {att.previewUrl && <img src={att.previewUrl} className="w-20 h-20 object-cover rounded-2xl border-2 border-white shadow-md transform transition-transform group-hover:scale-105" alt="p" />}
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} 
                  className="absolute -top-3 -right-3 bg-red-500 text-white w-7 h-7 rounded-full text-xs font-black shadow-lg hover:bg-red-600 active:scale-90 transition-all"
                >✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center shadow-sm border border-slate-100 group"
              title="Chụp ảnh bài tập"
            >
              <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button 
              onMouseDown={startRecording} 
              onMouseUp={stopRecording} 
              className={`w-14 h-14 rounded-full transition-all flex items-center justify-center shadow-md border ${
                isRecording ? 'bg-red-500 border-red-600 text-white animate-pulse scale-110' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600'
              }`}
              title="Nhấn giữ để nói"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex gap-3 bg-slate-50 p-2.5 rounded-[2.5rem] border border-slate-100 focus-within:ring-4 focus-within:ring-blue-100/50 focus-within:bg-white transition-all duration-300">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder={isRecording ? "Thầy đang nghe Khang nói..." : "Hỏi thầy bất cứ điều gì về Tiếng Anh 10..."} 
              className="flex-1 bg-transparent border-none px-5 outline-none text-slate-700 font-semibold placeholder:text-slate-400" 
            />
            <button 
              onClick={() => handleSend()} 
              disabled={loading || (!input.trim() && attachments.length === 0)} 
              className="bg-blue-600 text-white w-12 h-12 rounded-full hover:bg-indigo-600 disabled:opacity-20 transition-all shadow-lg flex items-center justify-center group active:scale-90"
            >
              <svg className="w-5 h-5 transform rotate-90 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
