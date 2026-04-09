import React from 'react';
import { motion } from 'framer-motion';

export interface BadgeProps {
  text: string;
  color?: string;
  animated?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  color = '#00F5FF',
  animated = false,
}) => {
  return (
    <motion.span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-fredoka border backdrop-blur-sm"
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}15`,
        boxShadow: `0 0 8px ${color}40`,
      }}
      animate={
        animated
          ? {
              boxShadow: [
                `0 0 8px ${color}40`,
                `0 0 16px ${color}70`,
                `0 0 8px ${color}40`,
              ],
            }
          : undefined
      }
      transition={
        animated
          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    >
      {text}
    </motion.span>
  );
};
