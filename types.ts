
export enum View {
  DASHBOARD = 'DASHBOARD',
  STUDY = 'STUDY',
  TEST = 'TEST',
  PROGRESS = 'PROGRESS',
  READING_WRITING = 'READING_WRITING',
  GRAMMAR_VOCAB = 'GRAMMAR_VOCAB'
}

export interface ReadingQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ReadingPassage {
  id: number;
  passage: string;
  questions: ReadingQuestion[];
}

export interface WritingQuestion {
  id: number;
  original: string;
  hint: string;
  correctAnswer: string;
  explanation: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ExamHistory {
  date: string;
  score: number;
  duration: number;
  strengths: string[];
  weaknesses: string[];
}
