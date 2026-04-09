import { useCallback, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useSound } from './useSound';
import type { GameMode, InputMode } from '../types';

interface UseGameReturn {
  startGame: (mode: GameMode, table: number | null, profileId: string, isChrono: boolean) => void;
  submitAnswer: (userAnswer: number) => void;
  nextQuestion: () => void;
  endGame: () => void;
  isGameActive: boolean;
  isShowingFeedback: boolean;
}

export function useGame(): UseGameReturn {
  const store = useGameStore();
  const sound = useSound();
  const questionStartRef = useRef<number>(Date.now());

  const startGame = useCallback(
    (mode: GameMode, table: number | null, profileId: string, isChrono: boolean) => {
      store.startGame(mode, table, profileId, isChrono);
      questionStartRef.current = Date.now();
    },
    [store]
  );

  const submitAnswer = useCallback(
    (userAnswer: number) => {
      const timeMs = Date.now() - questionStartRef.current;
      const prevCombo = store.currentSession?.currentCombo ?? 0;

      store.submitAnswer(userAnswer, timeMs);

      const result = store.lastAnswerResult;
      if (result) {
        if (result.correct) {
          sound.playCorrect(result.inputMode === 'keypad');
          const newCombo = (store.currentSession?.currentCombo ?? 0);
          if (newCombo >= 10 && prevCombo < 10) {
            sound.playComboSound(10);
          } else if (newCombo >= 5 && prevCombo < 5) {
            sound.playComboSound(5);
          }
        } else {
          sound.playError();
        }
      }
    },
    [store, sound]
  );

  const nextQuestion = useCallback(() => {
    store.nextQuestion();
    questionStartRef.current = Date.now();
  }, [store]);

  const endGame = useCallback(() => {
    const result = store.endGame();
    if (result?.isNewRecord) {
      sound.playNewRecord();
    }
    if (result?.beatDad) {
      sound.playBeatDadSound();
    }
  }, [store, sound]);

  return {
    startGame,
    submitAnswer,
    nextQuestion,
    endGame,
    isGameActive: store.currentSession !== null,
    isShowingFeedback: store.isShowingFeedback,
  };
}
