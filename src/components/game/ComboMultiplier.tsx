import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ComboMultiplierProps {
  multiplier: number;
}

export const ComboMultiplier: React.FC<ComboMultiplierProps> = ({
  multiplier,
}) => {
  if (multiplier <= 1) return null;

  const glowColor =
    multiplier >= 5
      ? '#FF00E5'
      : multiplier >= 3
        ? '#FF6B00'
        : '#00F5FF';

  return (
    <AnimatePresence>
      <motion.div
        className="inline-flex items-center"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      >
        <motion.span
          className="font-fredoka text-2xl font-extrabold"
          style={{
            color: glowColor,
            textShadow: `0 0 15px ${glowColor}, 0 0 30px ${glowColor}`,
          }}
          animate={{
            textShadow: [
              `0 0 15px ${glowColor}, 0 0 30px ${glowColor}`,
              `0 0 25px ${glowColor}, 0 0 50px ${glowColor}, 0 0 75px ${glowColor}`,
              `0 0 15px ${glowColor}, 0 0 30px ${glowColor}`,
            ],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          key={multiplier}
        >
          &times;{multiplier}
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
};
