import React from 'react';
import { motion } from 'framer-motion';

export interface TimerProps {
  elapsedMs: number;
  isRunning: boolean;
  isPulsing?: boolean;
  totalMs?: number;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

export const Timer: React.FC<TimerProps> = ({
  elapsedMs,
  isRunning,
  isPulsing = false,
  totalMs,
}) => {
  const progress = totalMs ? Math.min(elapsedMs / totalMs, 1) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  const displayMs = totalMs ? Math.max(totalMs - elapsedMs, 0) : elapsedMs;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      animate={
        isPulsing
          ? {
              scale: [1, 1.05, 1],
              filter: [
                'drop-shadow(0 0 4px rgba(255, 50, 50, 0.3))',
                'drop-shadow(0 0 12px rgba(255, 50, 50, 0.8))',
                'drop-shadow(0 0 4px rgba(255, 50, 50, 0.3))',
              ],
            }
          : undefined
      }
      transition={
        isPulsing
          ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    >
      {totalMs && (
        <svg
          className="absolute"
          width="100"
          height="100"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isPulsing ? '#FF4444' : '#00F5FF'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            style={{
              filter: `drop-shadow(0 0 6px ${isPulsing ? '#FF4444' : '#00F5FF'})`,
            }}
          />
        </svg>
      )}
      <span
        className={`
          font-fredoka text-2xl font-bold tabular-nums
          ${isPulsing ? 'text-red-400' : 'text-cyan-300'}
        `}
        style={{
          textShadow: isPulsing
            ? '0 0 10px rgba(255, 68, 68, 0.8)'
            : '0 0 10px rgba(0, 245, 255, 0.6)',
        }}
      >
        {formatTime(displayMs)}
      </span>
    </motion.div>
  );
};
