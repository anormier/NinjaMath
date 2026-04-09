import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnswerQCM } from './AnswerQCM';
import { AnswerKeypad } from './AnswerKeypad';
import type { InputMode, QuestionDisplay } from '../../types';

export interface AnswerSwitchProps {
  inputMode: InputMode;
  question: QuestionDisplay;
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  correctAnswer?: number;
  showResult?: boolean;
  userAnswer?: number | null;
}

export const AnswerSwitch: React.FC<AnswerSwitchProps> = ({
  inputMode,
  question,
  onAnswer,
  disabled = false,
  correctAnswer,
  showResult = false,
  userAnswer = null,
}) => {
  const isKeypad = inputMode === 'keypad';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={inputMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {isKeypad ? (
          <AnswerKeypad onSubmit={onAnswer} disabled={disabled} />
        ) : (
          <AnswerQCM
            choices={question.choices ?? []}
            onAnswer={onAnswer}
            disabled={disabled}
            correctAnswer={correctAnswer}
            showResult={showResult}
            userAnswer={userAnswer}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
