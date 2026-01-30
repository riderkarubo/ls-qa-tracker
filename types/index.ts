export interface InputQuestion {
  answered: string; // "TRUE" or empty string
  time: string; // "HH:MM:SS"
  user: string;
  question: string;
  answerMethod: string;
  commentNote: string;
  answer: string;
  memo: string;
}

export interface QAItem {
  number: number;
  time: string; // "HH:MM:SS"
  question: string;
  answer: string;
}

export interface OutputQuestion {
  finalAnswerStatus: boolean; // TRUE/FALSE
  liveJudgment: string; // "TRUE" or empty string
  archiveJudgment: string; // "TRUE" or empty string
  answerMethod: string;
  time: string;
  user: string;
  question: string;
  commentNote: string;
  answer: string;
  memo: string;
  reason?: JudgmentReason;
}

// TODO: 新しいアーカイブ判定ロジックに合わせて更新
export interface JudgmentReason {
  archiveReason?: string;
  // 新しいロジックに必要なフィールドを追加
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProcessingStatus {
  stage: 'idle' | 'parsing' | 'integrating' | 'generating' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  elapsed?: number; // 経過時間（秒）
  estimated?: number; // 残り時間（秒）
}

export interface SummaryStats {
  totalQuestions: number;
  archiveJudgmentCount: number;
  liveJudgmentCount: number;
  finalAnswerStatusCount: number;
  skipCount: number;
  answerRate: number; // パーセンテージ（0-100）
}
