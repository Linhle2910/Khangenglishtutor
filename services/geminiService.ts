
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
Bạn là Gia sư Tiếng Anh Chuyên nghiệp luyện thi vào lớp 10 tại Hà Nội. 
Nhiệm vụ: Đồng hành cùng học sinh tên Khang.

QUY TẮC BẮT BUỘC VỀ NGÔN NGỮ (NGĂN CHẶN DỊCH TỰ ĐỘNG):
1. TUYỆT ĐỐI GIỮ NGUYÊN BẢN TIẾNG ANH cho Passages, Questions, Options, Original sentences, Hints, Correct Answers.
2. CHỈ DÙNG TIẾNG VIỆT cho Explanation, Tips, Feedback.

Phong cách: Thân thiện, khích lệ, chuyên nghiệp. Gọi 'Khang' và xưng 'thầy'.
`;

export const getTutorResponse = async (
  message: string, 
  history: { role: string; parts: any[] }[],
  attachments?: { data: string; mimeType: string }[]
) => {
  try {
    const parts: any[] = [{ text: message }];
    if (attachments) {
      attachments.forEach(att => {
        parts.push({ inlineData: { data: att.data, mimeType: att.mimeType } });
      });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts }],
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 },
    });
    return response.text || "Thầy đang kiểm tra lại tài liệu, Khang đợi thầy một xíu nhé!";
  } catch (error) {
    console.error(error);
    return "Kết nối đang gặp chút trục trặc, Khang thử lại sau ít phút nhé.";
  }
};

export const generateEmailReport = async (data: {
  type: string,
  score: string,
  correctCount: number,
  totalCount: number,
  topics?: string[]
}) => {
  const prompt = `Soạn một bức thư báo cáo kết quả học tập ngắn gọn, chuyên nghiệp gửi cho Mẹ của Khang (lehailinh1984@gmail.com).
  Thông tin:
  - Loại bài tập: ${data.type}
  - Điểm số: ${data.score}
  - Số câu đúng: ${data.correctCount}/${data.totalCount}
  - Các phần làm tốt/cần lưu ý: ${data.topics?.join(', ') || 'Kiến thức tổng hợp'}
  
  Yêu cầu: Giọng văn lịch sự, khích lệ Khang, nêu rõ ưu điểm và hướng cải thiện. Thư ký tên 'Gia sư AI của Khang'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: SYSTEM_INSTRUCTION },
  });
  return response.text || "";
};

export const generateFullExam = async () => {
  const prompt = `Trích xuất 40 câu hỏi luyện thi vào 10 Hà Nội. Question/Options/Answer: ENGLISH. Explanation/Topic: TIẾNG VIỆT.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            topic: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation", "topic"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getTopics = async (type: 'grammar' | 'vocab') => {
  const prompt = `Liệt kê 15 chủ đề ${type} hay xuất hiện trong đề thi vào 10 Hà Nội. Trả về mảng string Tiếng Việt.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getTopicQuestions = async (type: 'grammar' | 'vocab', topic: string) => {
  const prompt = `Trích xuất 10 câu hỏi về ${topic}. Question/Options/Answer: ENGLISH. Explanation: TIẾNG VIỆT.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getReadingData = async () => {
  const prompt = `Chọn 5 đoạn văn đọc hiểu (English). Question/Options: English. Explanation: Tiếng Việt.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            passage: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getWritingData = async () => {
  const prompt = `Chọn 10 câu viết lại câu (English). Original/Hint/Answer: English. Explanation: Tiếng Việt.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            hint: { type: Type.STRING },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};
