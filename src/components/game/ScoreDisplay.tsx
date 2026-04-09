import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ScoreDisplayProps {
  score: number;
  lastGain: number | null;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  lastGain,
}) => {
  const [gainKey, setGainKey] = useState(0);

  useEffect(() => {
    if (lastGain !== null && lastGain > 0) {
      setGainKey((k) => k + 1);
    }
  }, [lastGain, score]);

  return (
    <div className="relative inline-flex items-center">
      <motion.span
        key={score}
        className="font-fredoka text-3xl font-bold text-white"
        style={{
          textShadow: '0 0 15px rgba(0, 245, 255, 0.6)',
        }}
        initial={{ scale: 1.3, y: -4 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      >
        {score.toLocaleString()}
      </motion.span>

      <AnimatePresence>
        {lastGain !== null && lastGain > 0 && (
          <motion.span
            key={gainKey}
            className="absolute -right-2 top-0 font-fredoka text-lg font-bold text-lime-400 pointer-events-none whitespace-nowrap"
            style={{
              textShadow: '0 0 10px rgba(57, 255, 20, 0.8)',
              transform: 'translateX(100%)',
            }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            +{lastGain}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};
