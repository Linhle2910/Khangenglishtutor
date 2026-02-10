
import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI directly with process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const prompt = `Bạn là bộ não điều phối của ứng dụng luyện thi. Hãy thực hiện quy trình tạo đề thi ngẫu nhiên từ ngân hàng câu hỏi tại: https://docs.google.com/spreadsheets/d/1dR_VE7thJzCgKzZtvfVhOBLCBylf5tqD8vhlDdkziE8/edit?gid=0#gid=0

YÊU CẦU CẤU TRÚC (TỔNG 40 CÂU):
1. Phần 1: Ngữ âm - 4 câu (2 câu phát âm, 2 câu trọng âm).
2. Phần 2: Ngữ pháp & Từ vựng - 8 câu (các chủ điểm lớp 9-10).
3. Phần 3: Kỹ năng Đọc - 20 câu (bao gồm: thông báo/biển báo, điền từ vào đoạn văn, đọc hiểu trả lời câu hỏi).
4. Phần 4: Kỹ năng Viết - 8 câu (viết lại câu, sắp xếp câu, câu chủ đề).

QUY ĐỊNH:
- Question/Options/Answer: GIỮ NGUYÊN TIẾNG ANH.
- Explanation/Topic: TIẾNG VIỆT.
- Sắp xếp theo đúng thứ tự đề thi mẫu Hà Nội 2025. 
- Không lặp lại câu hỏi.`;

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
            topic: { type: Type.STRING },
            part: { type: Type.STRING, description: "Tên phần: Ngữ âm, Ngữ pháp & Từ vựng, Kỹ năng Đọc, Kỹ năng Viết" }
          },
          required: ["question", "options", "correctAnswer", "explanation", "topic", "part"]
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
