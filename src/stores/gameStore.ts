// ==================== ACTIVE GAME SESSION STORE ====================

import { create } from 'zustand';
import type {
  AnswerResult,
  GameMode,
  GameSession,
  QuestionDisplay,
  QuestionState,
  SessionResult,
} from '../types';
import { useStatsStore } from './statsStore';
import {
  createSession,
  processAnswer,
  getNextQuestion,
  endSession,
} from '../engine/sessionManager';

interface GameState {
  currentSession: GameSession | null;
  currentQuestion: QuestionDisplay | null;
  currentFacts: QuestionState[];
  isShowingFeedback: boolean;
  lastAnswerResult: AnswerResult | null;
  sessionResult: SessionResult | null;
  soundEnabled: boolean;
}

interface GameActions {
  startGame: (
    mode: GameMode,
    table: number | null,
    profileId: string,
    isChrono: boolean,
  ) => void;
  submitAnswer: (userAnswer: number, timeMs: number) => void;
  nextQuestion: () => void;
  endGame: () => SessionResult;
  toggleSound: () => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;

const initialState: GameState = {
  currentSession: null,
  currentQuestion: null,
  currentFacts: [],
  isShowingFeedback: false,
  lastAnswerResult: null,
  sessionResult: null,
  soundEnabled: true,
};

export const useGameStore = create<GameStore>()((set, get) => ({
  // ---------- state ----------
  ...initialState,

  // ---------- actions ----------

  startGame: (
    mode: GameMode,
    table: number | null,
    profileId: string,
    isChrono: boolean,
  ): void => {
    const statsStore = useStatsStore.getState();

    // Load (or initialise) facts for the requested table(s)
    let facts: QuestionState[] = [];
    if (table !== null) {
      const tableStats = statsStore.getOrCreateTableStats(profileId, table);
      facts = tableStats.facts;
    } else {
      // max_power mode -- load all tables
      for (let t = 2; t <= 12; t++) {
        const tableStats = statsStore.getOrCreateTableStats(profileId, t);
        facts = [...facts, ...tableStats.facts];
      }
    }

    const session = createSession(mode, table, profileId, isChrono);
    const question = getNextQuestion(session, facts);

    set({
      currentSession: session,
      currentFacts: facts,
      currentQuestion: question,
      isShowingFeedback: false,
      lastAnswerResult: null,
      sessionResult: null,
    });
  },

  submitAnswer: (userAnswer: number, timeMs: number): void => {
    const { currentSession, currentFacts, currentQuestion } = get();
    if (!currentSession || !currentQuestion) return;

    const { session, updatedFact, answerResult } = processAnswer(
      currentSession,
      currentFacts,
      userAnswer,
      timeMs,
      currentQuestion,
    );

    // Replace the old fact with the updated one in the local facts array
    const updatedFacts = currentFacts.map((f) =>
      f.a === updatedFact.a && f.b === updatedFact.b ? updatedFact : f,
    );

    // Persist updated fact to the stats store
    const statsStore = useStatsStore.getState();
    const table = currentSession.table ?? currentQuestion.a;
    statsStore.updateFact(currentSession.profileId, table, updatedFact);

    set({
      currentSession: session,
      currentFacts: updatedFacts,
      lastAnswerResult: answerResult,
      isShowingFeedback: true,
    });
  },

  nextQuestion: (): void => {
    const { currentSession, currentFacts } = get();
    if (!currentSession) return;

    const question = getNextQuestion(currentSession, currentFacts);

    set({
      currentQuestion: question,
      isShowingFeedback: false,
      lastAnswerResult: null,
    });
  },

  endGame: (): SessionResult => {
    const { currentSession } = get();
    if (!currentSession) {
      throw new Error('No active session to end');
    }

    const result: SessionResult = endSession(currentSession);

    // Record in the stats store
    const statsStore = useStatsStore.getState();
    statsStore.recordSession(currentSession.profileId, result);

    set({
      sessionResult: result,
      isShowingFeedback: false,
      currentQuestion: null,
    });

    return result;
  },

  toggleSound: (): void => {
    set((s) => ({ soundEnabled: !s.soundEnabled }));
  },

  resetGame: (): void => {
    set({ ...initialState, soundEnabled: get().soundEnabled });
  },
}));
