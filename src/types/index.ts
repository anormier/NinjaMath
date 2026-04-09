// ==================== INPUT & QUESTION TYPES ====================

export type InputMode = 'qcm4' | 'qcm3' | 'qcm2' | 'keypad';

export type QuestionStyle =
  | 'classic'
  | 'reverse'
  | 'fill_blank'
  | 'word_fr'
  | 'word_playful'
  | 'emoji'
  | 'big_font'
  | 'upside_text'
  | 'color_pop'
  | 'handwritten';

export type Bucket = 'new' | 'learning' | 'review' | 'mastered';

export interface QuestionState {
  a: number;
  b: number;
  answer: number;
  inputMode: InputMode;
  consecutiveCorrectInMode: number;
  correctCount: number;
  wrongCount: number;
  lastSeen: number;
  avgResponseTime: number;
  easeFactor: number;
  interval: number;
  bucket: Bucket;
}

export interface QuestionDisplay {
  a: number;
  b: number;
  answer: number;
  style: QuestionStyle;
  inputMode: InputMode;
  displayText: string;
  displaySubtext?: string;
  emoji?: string;
  choices?: number[];
  fontClass?: string;
  cssTransform?: string;
  colorMap?: string[];
}

// ==================== SCORING ====================

export interface ScoreEvent {
  basePoints: number;
  speedBonus: number;
  comboMultiplier: number;
  totalPoints: number;
  specialBonus: string | null;
  specialBonusPoints: number;
}

// ==================== SESSION ====================

export type GameMode = 'max_power' | 'single_table';

export interface AnswerResult {
  a: number;
  b: number;
  answer: number;
  userAnswer: number;
  correct: boolean;
  timeMs: number;
  inputMode: InputMode;
  style: QuestionStyle;
  scoreEvent: ScoreEvent;
}

export interface SessionResult {
  mode: GameMode;
  table: number | null;
  profileId: string;
  totalTime: number;
  totalScore: number;
  answers: AnswerResult[];
  correctCount: number;
  wrongCount: number;
  maxCombo: number;
  isChrono: boolean;
  isNewRecord: boolean;
  beatDad: boolean;
  factsProgressed: Array<{ a: number; b: number; from: InputMode; to: InputMode }>;
}

export interface GameSession {
  id: string;
  mode: GameMode;
  table: number | null;
  profileId: string;
  isChrono: boolean;
  startTime: number;
  answers: AnswerResult[];
  currentCombo: number;
  maxCombo: number;
  totalScore: number;
  questionsAsked: number;
  sessionErrors: Array<{ a: number; b: number }>;
  newFactsIntroduced: number;
  factsProgressed: Array<{ a: number; b: number; from: InputMode; to: InputMode }>;
  lastStyle: QuestionStyle | null;
}

// ==================== USER & PROFILE ====================

export type ProfileRole = 'child' | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: ProfileRole;
  createdAt: number;
}

// ==================== STATS ====================

export interface TableStats {
  table: number;
  facts: QuestionState[];
  bestChronoTime: number | null;
  bestChronoScore: number | null;
  sessionsPlayed: number;
}

export interface ProfileStats {
  profileId: string;
  tables: Record<number, TableStats>;
  totalScore: number;
  totalSessions: number;
  sessionHistory: SessionHistoryEntry[];
}

export interface SessionHistoryEntry {
  date: number;
  mode: GameMode;
  table: number | null;
  score: number;
  time: number;
  correctCount: number;
  totalCount: number;
  isChrono: boolean;
}

// ==================== SCREEN NAVIGATION ====================

export type Screen =
  | 'home'
  | 'profile'
  | 'mode_select'
  | 'table_select'
  | 'game'
  | 'result'
  | 'leaderboard';

// ==================== CONSTANTS ====================

export const AVATARS = ['🚀', '👾', '🦊', '🐱', '🦄', '🎮', '🌟', '🔥', '💎', '🎯', '🏆', '👑'] as const;

export const NEON_COLORS = ['#00F5FF', '#FF00E5', '#39FF14', '#FF6B00'] as const;

export const TABLES_RANGE = { min: 2, max: 12 } as const;

export const INPUT_MODE_THRESHOLDS = {
  qcm4_to_qcm3: 3,
  qcm3_to_qcm2: 2,
  qcm2_to_keypad: 2,
} as const;

export const SCORE_BASE = {
  qcm4: 50,
  qcm3: 75,
  qcm2: 90,
  keypad: 100,
} as const;

export const SPEED_BONUS_KEYPAD = [
  { threshold: 1500, bonus: 75 },
  { threshold: 2500, bonus: 50 },
  { threshold: 3500, bonus: 25 },
  { threshold: 5000, bonus: 10 },
] as const;

export const SPEED_BONUS_QCM = [
  { threshold: 1000, bonus: 30 },
  { threshold: 2000, bonus: 15 },
] as const;

export const COMBO_MULTIPLIERS = [
  { streak: 20, multiplier: 5 },
  { streak: 10, multiplier: 3 },
  { streak: 5, multiplier: 2 },
  { streak: 3, multiplier: 1.5 },
] as const;

export const SPECIAL_BONUSES = {
  perfectTable: 500,
  personalRecord: 200,
  beatDad: 1000,
  firstKeypad: 300,
} as const;

export const MASTERY_PERCENT: Record<string, number> = {
  qcm4: 10,
  qcm3: 30,
  qcm2: 60,
  'keypad-learning': 80,
  mastered: 100,
};

export const MAX_NEW_FACTS_PER_SESSION = 3;
export const CHRONO_QUESTIONS = 10;
export const FACTS_PER_TABLE = 10;
