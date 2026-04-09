import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface StreakIndicatorProps {
  streak: number;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ streak }) => {
  if (streak < 2) return null;

  const fireScale = Math.min(1 + (streak - 2) * 0.15, 2.5);

  return (
    <AnimatePresence>
      <motion.div
        className="flex items-center gap-1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <motion.span
          className="select-none"
          style={{ fontSize: `${fireScale}rem` }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🔥
        </motion.span>
        <motion.span
          className="font-fredoka text-xl font-bold"
          style={{
            color: '#FF6B00',
            textShadow: '0 0 12px rgba(255, 107, 0, 0.8)',
          }}
          key={streak}
          initial={{ scale: 1.5, y: -5 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          x{streak}
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
};
