// ==================== APP CONSTANTS ====================

/** Multiplication tables available in the game (2 through 12) */
export const TABLES: readonly number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Neon colours used for QCM answer buttons */
export const QCM_COLORS: readonly string[] = ['#00F5FF', '#FF00E5', '#39FF14', '#FF6B00'];

/** Duration in ms to show feedback after an answer */
export const FEEDBACK_DURATION = 1500;

/** Duration in ms to show feedback after a correct answer */
export const CORRECT_FEEDBACK_DURATION = 800;

/** French encouragement messages shown on correct answers */
export const ENCOURAGEMENTS: readonly string[] = [
  'Bravo!',
  'Super!',
  'Génial!',
  'Excellent!',
  'Trop fort!',
];

/** French encouragement messages shown on wrong answers */
export const WRONG_ENCOURAGEMENTS: readonly string[] = [
  'Pas grave, réessaie!',
  'Presque!',
  'Tu vas y arriver!',
  'Continue!',
];
