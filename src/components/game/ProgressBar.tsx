import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  current: number;
  total: number;
  correctCount: number;
  wrongCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  correctCount,
  wrongCount,
}) => {
  const remaining = total - correctCount - wrongCount;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-fredoka text-sm text-white/70"
        >
          {current}/{total}
        </span>
      </div>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-white/10">
        {correctCount > 0 && (
          <motion.div
            className="h-full bg-green-500"
            style={{
              boxShadow: '0 0 8px rgba(57, 255, 20, 0.5)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(correctCount / total) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
        {wrongCount > 0 && (
          <motion.div
            className="h-full bg-red-500"
            style={{
              boxShadow: '0 0 8px rgba(255, 68, 68, 0.5)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(wrongCount / total) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
        {remaining > 0 && (
          <div
            className="h-full bg-gray-600/50"
            style={{ width: `${(remaining / total) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
};
