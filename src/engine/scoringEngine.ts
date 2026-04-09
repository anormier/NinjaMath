import type {
  InputMode,
  ScoreEvent,
} from '../types/index.ts';
import {
  SCORE_BASE,
  SPEED_BONUS_KEYPAD,
  SPEED_BONUS_QCM,
  COMBO_MULTIPLIERS,
} from '../types/index.ts';

function getSpeedBonus(inputMode: InputMode, timeMs: number): number {
  if (inputMode === 'keypad') {
    for (const tier of SPEED_BONUS_KEYPAD) {
      if (timeMs < tier.threshold) {
        return tier.bonus;
      }
    }
    return 0;
  }

  // All QCM modes use the same speed bonus table
  for (const tier of SPEED_BONUS_QCM) {
    if (timeMs < tier.threshold) {
      return tier.bonus;
    }
  }
  return 0;
}

function getComboMultiplier(combo: number): number {
  for (const tier of COMBO_MULTIPLIERS) {
    if (combo >= tier.streak) {
      return tier.multiplier;
    }
  }
  return 1;
}

export function calculateScore(
  correct: boolean,
  inputMode: InputMode,
  timeMs: number,
  combo: number
): ScoreEvent {
  if (!correct) {
    const penalty = inputMode === 'keypad' ? -30 : -15;
    return {
      basePoints: penalty,
      speedBonus: 0,
      comboMultiplier: 1,
      totalPoints: penalty,
      specialBonus: null,
      specialBonusPoints: 0,
    };
  }

  const basePoints = SCORE_BASE[inputMode];
  const speedBonus = getSpeedBonus(inputMode, timeMs);
  const comboMultiplier = getComboMultiplier(combo);

  const rawTotal = Math.round((basePoints + speedBonus) * comboMultiplier);
  // Never negative total (though correct answers shouldn't be negative anyway)
  const totalPoints = Math.max(0, rawTotal);

  return {
    basePoints,
    speedBonus,
    comboMultiplier,
    totalPoints,
    specialBonus: null,
    specialBonusPoints: 0,
  };
}
