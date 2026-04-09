import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NEON_COLORS } from '../../types';
import type { QuestionDisplay } from '../../types';

export interface QuestionCardProps {
  question: QuestionDisplay;
}

const ClassicQuestion: React.FC<{ q: QuestionDisplay }> = ({ q }) => (
  <span
    className="font-fredoka text-5xl sm:text-6xl font-bold text-white"
    style={{ textShadow: '0 0 20px rgba(0, 245, 255, 0.6)' }}
  >
    {q.displayText}
  </span>
);

const ReverseQuestion: React.FC<{ q: QuestionDisplay }> = ({ q }) => (
  <span className="font-fredoka text-5xl sm:text-6xl font-bold text-white">
    <motion.span
      className="text-magenta-400"
      style={{ color: '#FF00E5', textShadow: '0 0 15px rgba(255, 0, 229, 0.8)' }}
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    >
      ?
    </motion.span>
    <span style={{ textShadow: '0 0 20px rgba(0, 245, 255, 0.6)' }}>
      {' '}{q.displayText.replace(/^\?\s*/, '')}
    </span>
  </span>
);

const FillBlankQuestion: React.FC<{ q: QuestionDisplay }> = ({ q }) => {
  const parts = q.displayText.split('_');
  return (
    <span className="font-fredoka text-5xl sm:text-6xl font-bold text-white"
      style={{ textShadow: '0 0 20px rgba(0, 245, 255, 0.6)' }}
    >
      {parts[0]}
      <motion.span
        style={{ color: '#39FF14', textShadow: '0 0 15px rgba(57, 255, 20, 0.8)' }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        _
      </motion.span>
      {parts[1]}
    </span>
  );
};

const WordQuestion: React.FC<{ q: QuestionDisplay }> = ({ q }) => (
  <div className="text-center">
    <span
      className="font-fredoka text-3xl sm:text-4xl font-bold text-white"
      style={{ textShadow: '0 0 15px rgba(0, 245, 255, 0.6)' }}
    >
      {q.displayText}
    </span>
    {q.displaySubtext && (
      <p className="text-white/50 text-lg mt-2 font-fredoka">{q.displaySubtext}</p>
    )}
  </div>
);

const EmojiQuestion: React.FC<{ q: QuestionDisplay }> = ({ q }) => (
  <div className="flex items-center gap-3">
    <span className="text-5xl">{q.emoji || '🎲'}</span>
    <span
      className="font-fredoka text-5xl sm:text-6xl font-bold text-white"
      style={{ textShadow: '0 0 20px rgba(0, 245, 255, 0.6)' }}
    >
      {q.displayText}
    </span>
  </div>
);

const BigFontQuestion: React.FC<{ q: QuestionDisplay }> = ({ q }) => (
  <span
    className="font-fredoka font-bold text-white text-[min(20vw,10rem)] leading-none"
    style={{ textShadow: '0 0 30px rgba(0, 245, 255, 0.6)' }}
  >
    {q.displayText}
  </span>
);

const UpsideTextQuestion: React.FC<{ q: QuestionDisplay }> = ({ q }) => (
  <span
    className="font-fredoka text-5xl sm:text-6xl font-bold text-white inline-block"
    style={{
      transform: 'rotate(180deg)',
      textShadow: '0 0 20px rgba(255, 0, 229, 0.6)',
    }}
  >
    {q.displayText}
  </span>
);

const ColorPopQuestion: React.FC<{ q: QuestionDisplay }> = ({ q }) => {
  const chars = q.displayText.split('');
  const colors = q.colorMap || [...NEON_COLORS];
  return (
    <span className="font-fredoka text-5xl sm:text-6xl font-bold">
      {chars.map((char, i) => (
        <span
          key={i}
          style={{
            color: colors[i % colors.length],
            textShadow: `0 0 15px ${colors[i % colors.length]}`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

const HandwrittenQuestion: React.FC<{ q: QuestionDisplay }> = ({ q }) => (
  <span
    className="font-caveat text-6xl sm:text-7xl font-bold text-white"
    style={{
      textShadow: '0 0 15px rgba(0, 245, 255, 0.6)',
    }}
  >
    {q.displayText}
  </span>
);

const STYLE_COMPONENTS: Record<string, React.FC<{ q: QuestionDisplay }>> = {
  classic: ClassicQuestion,
  reverse: ReverseQuestion,
  fill_blank: FillBlankQuestion,
  word_fr: WordQuestion,
  word_playful: WordQuestion,
  emoji: EmojiQuestion,
  big_font: BigFontQuestion,
  upside_text: UpsideTextQuestion,
  color_pop: ColorPopQuestion,
  handwritten: HandwrittenQuestion,
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const StyleComponent = STYLE_COMPONENTS[question.style] || ClassicQuestion;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${question.a}-${question.b}-${question.style}`}
        className="flex items-center justify-center min-h-[120px] p-6"
        initial={{ x: 80, opacity: 0, rotate: 2 }}
        animate={{ x: 0, opacity: 1, rotate: 0 }}
        exit={{ x: -80, opacity: 0, rotate: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <StyleComponent q={question} />
      </motion.div>
    </AnimatePresence>
  );
};
