import { useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
  playCorrectQCM,
  playCorrectKeypad,
  playWrong,
  playCombo5,
  playCombo10,
  playRecord,
  playBeatDad,
  playLevelUp,
  playTick,
  speakVictory,
} from '../utils/sounds';

interface UseSoundReturn {
  playCorrect: (isKeypad: boolean) => void;
  playError: () => void;
  playComboSound: (combo: number) => void;
  playNewRecord: () => void;
  playBeatDadSound: () => void;
  playLevelUpSound: () => void;
  playTickSound: () => void;
  playVictoryVoice: () => void;
}

export function useSound(): UseSoundReturn {
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  const playCorrect = useCallback(
    (isKeypad: boolean) => {
      if (!soundEnabled) return;
      if (isKeypad) playCorrectKeypad();
      else playCorrectQCM();
    },
    [soundEnabled]
  );

  const playError = useCallback(() => {
    if (!soundEnabled) return;
    playWrong();
  }, [soundEnabled]);

  const playComboSound = useCallback(
    (combo: number) => {
      if (!soundEnabled) return;
      if (combo >= 10) playCombo10();
      else if (combo >= 5) playCombo5();
    },
    [soundEnabled]
  );

  const playNewRecord = useCallback(() => {
    if (!soundEnabled) return;
    playRecord();
  }, [soundEnabled]);

  const playBeatDadSound = useCallback(() => {
    if (!soundEnabled) return;
    playBeatDad();
  }, [soundEnabled]);

  const playLevelUpSound = useCallback(() => {
    if (!soundEnabled) return;
    playLevelUp();
  }, [soundEnabled]);

  const playTickSound = useCallback(() => {
    if (!soundEnabled) return;
    playTick();
  }, [soundEnabled]);

  const playVictoryVoice = useCallback(() => {
    if (!soundEnabled) return;
    speakVictory();
  }, [soundEnabled]);

  return {
    playCorrect,
    playError,
    playComboSound,
    playNewRecord,
    playBeatDadSound,
    playLevelUpSound,
    playTickSound,
    playVictoryVoice,
  };
}
