import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NEON_COLORS } from '../../types';

export interface CorrectAnimationProps {
  show: boolean;
  points: number;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 20;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
  const distance = 80 + Math.random() * 120;
  const colors = [...NEON_COLORS, '#FFD700', '#FFFFFF'];
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    color: colors[Math.floor(Math.random() * colors.length)],
    isEmoji: Math.random() > 0.6,
    delay: Math.random() * 0.2,
  };
});

export const CorrectAnimation: React.FC<CorrectAnimationProps> = ({
  show,
  points,
  onComplete,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute text-lg"
              style={{
                color: p.color,
                textShadow: `0 0 6px ${p.color}`,
              }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [0, 1.2, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 0.7,
                delay: p.delay,
                ease: 'easeOut',
              }}
            >
              {p.isEmoji ? '⭐' : '✦'}
            </motion.div>
          ))}

          {/* Points floating up */}
          <motion.span
            className="absolute font-fredoka text-4xl font-extrabold"
            style={{
              color: '#39FF14',
              textShadow: '0 0 20px rgba(57, 255, 20, 0.8), 0 0 40px rgba(57, 255, 20, 0.4)',
            }}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -100, scale: 1.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            +{points}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
