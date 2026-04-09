import React from 'react';
import { motion } from 'framer-motion';

const BUTTON_COLORS = [
  { border: '#00F5FF', bg: 'rgba(0, 245, 255, 0.1)', shadow: 'rgba(0, 245, 255, 0.3)' },
  { border: '#FF00E5', bg: 'rgba(255, 0, 229, 0.1)', shadow: 'rgba(255, 0, 229, 0.3)' },
  { border: '#39FF14', bg: 'rgba(57, 255, 20, 0.1)', shadow: 'rgba(57, 255, 20, 0.3)' },
  { border: '#FF6B00', bg: 'rgba(255, 107, 0, 0.1)', shadow: 'rgba(255, 107, 0, 0.3)' },
];

export interface AnswerQCMProps {
  choices: number[];
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  correctAnswer?: number;
  showResult?: boolean;
  userAnswer?: number | null;
}

export const AnswerQCM: React.FC<AnswerQCMProps> = ({
  choices,
  onAnswer,
  disabled = false,
  correctAnswer,
  showResult = false,
  userAnswer = null,
}) => {
  const count = choices.length;
  const gridClass =
    count === 4
      ? 'grid-cols-2 grid-rows-2'
      : count === 3
        ? 'grid-cols-3'
        : 'grid-cols-2';

  const getButtonState = (choice: number) => {
    if (!showResult) return 'idle';
    if (choice === correctAnswer && (userAnswer === choice || userAnswer !== correctAnswer)) return 'correct';
    if (choice === userAnswer && choice !== correctAnswer) return 'wrong';
    return 'idle';
  };

  return (
    <div className={`grid ${gridClass} gap-3 w-full max-w-md mx-auto`}>
      {choices.map((choice, i) => {
        const colors = BUTTON_COLORS[i % BUTTON_COLORS.length];
        const state = getButtonState(choice);

        const borderColor =
          state === 'correct'
            ? '#39FF14'
            : state === 'wrong'
              ? '#FF4444'
              : colors.border;

        const bgColor =
          state === 'correct'
            ? 'rgba(57, 255, 20, 0.25)'
            : state === 'wrong'
              ? 'rgba(255, 68, 68, 0.25)'
              : colors.bg;

        const shadowColor =
          state === 'correct'
            ? 'rgba(57, 255, 20, 0.5)'
            : state === 'wrong'
              ? 'rgba(255, 68, 68, 0.5)'
              : colors.shadow;

        return (
          <motion.button
            key={`${choice}-${i}`}
            onClick={() => !disabled && onAnswer(choice)}
            disabled={disabled}
            className="font-fredoka text-2xl sm:text-3xl font-bold text-white
              min-h-[72px] rounded-xl border-2 backdrop-blur-md
              cursor-pointer select-none disabled:cursor-not-allowed"
            style={{
              borderColor,
              backgroundColor: bgColor,
              boxShadow: `0 0 12px ${shadowColor}, inset 0 0 10px ${shadowColor}`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              state === 'wrong'
                ? {
                    scale: 1,
                    opacity: 1,
                    x: [0, -8, 8, -8, 8, 0],
                  }
                : state === 'correct'
                  ? {
                      scale: [1, 1.08, 1],
                      opacity: 1,
                    }
                  : { scale: 1, opacity: 1 }
            }
            transition={
              state === 'wrong'
                ? { x: { duration: 0.4 }, delay: i * 0.05 }
                : state === 'correct'
                  ? { scale: { duration: 0.4, repeat: 2 }, delay: i * 0.05 }
                  : {
                      delay: i * 0.08,
                      type: 'spring',
                      stiffness: 400,
                      damping: 15,
                    }
            }
            whileHover={!disabled && !showResult ? { scale: 1.05 } : undefined}
            whileTap={!disabled && !showResult ? { scale: 0.95 } : undefined}
          >
            {choice}
          </motion.button>
        );
      })}
    </div>
  );
};
