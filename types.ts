export enum View {
  DASHBOARD = 'DASHBOARD',
  MENTOR = 'MENTOR',
  EVALUATOR = 'EVALUATOR',
  AUGMENTOR = 'AUGMENTOR',
  VIDEO_INSIGHTS = 'VIDEO_INSIGHTS'
}

export interface LeaderboardEntry {
  rank: number;
  team: string;
  score: number;
  entries: number;
  lastSubmission: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}

export interface VideoAnalysisResult {
  summary: string;
  objects: string[];
  actions: string[];
  transcript: string;
}

export interface ResumeAnalysis {
  score: number;
  passProbability: 'Low' | 'Medium' | 'High';
  strengths: string[];
  redFlags: string[];
  summary: string;
  interviewFocus: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp?: Date;
  isThinking?: boolean;
}

export interface JobContext {
  role: string;
  company: string;
  resumeBase64: string;
  resumeMimeType: string;
}