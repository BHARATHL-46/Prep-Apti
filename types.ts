
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed' | 'Custom';
export type WeightageMode = 'Equal' | 'Custom';
export type UserStatus = 'pending' | 'approved' | 'blocked';

export interface User {
  id: string;
  email: string;
  fullName: string;
  gender: string;
  password: string;
  status: UserStatus;
  isAdmin: boolean;
  createdAt: number;
}

export interface DifficultySplit {
  easy: number;
  medium: number;
  hard: number;
}

export interface TopicWeightage {
  topic: string;
  percentage: number;
}

export interface TopicDistribution {
  name: string;
  count: number;
}

export interface RevisionData {
  topic: string;
  basics: string;
  formulas: string[];
  tips: string[];
}

export interface TestConfig {
  topics: string[];
  weightageMode: WeightageMode;
  topicWeightages: TopicWeightage[];
  difficulty: Difficulty;
  difficultySplit: DifficultySplit;
  questionCount: number;
  durationInMinutes: number;
}

export interface Question {
  id: string;
  topic: string;
  difficulty: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionIndex: number | null;
}

export interface TestResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  timeSpent: number;
  date: number;
  userId: string;
}

export enum AppState {
  LOGIN,
  REGISTER,
  WAITING,
  HOME,
  SETUP_TOPICS,
  SETUP_WEIGHTAGE,
  SETUP_DIFFICULTY,
  SETUP_CONFIG,
  LOADING,
  TESTING,
  RESULT,
  HISTORY,
  ADMIN_DASHBOARD,
  SETTINGS
}
