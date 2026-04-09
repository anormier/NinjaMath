import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NEON_COLORS } from '../../types';

export interface NewRecordAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const STAR_COUNT = 16;

export const NewRecordAnimation: React.FC<NewRecordAnimationProps> = ({
  show,
  onComplete,
}) => {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => {
        const angle = (i / STAR_COUNT) * Math.PI * 2;
        const distance = 120 + Math.random() * 150;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          color: NEON_COLORS[i % NEON_COLORS.length],
          delay: i * 0.05,
          size: 16 + Math.random() * 16,
        };
      }),
    [show]
  );

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Expanding stars */}
          {stars.map((star) => (
            <motion.span
              key={star.id}
              className="absolute"
              style={{
                color: star.color,
                fontSize: star.size,
                textShadow: `0 0 10px ${star.color}, 0 0 20px ${star.color}`,
              }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: star.x,
                y: star.y,
                scale: [0, 1.5, 0.8],
                opacity: [0, 1, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 1.5,
                delay: star.delay,
                ease: 'easeOut',
              }}
            >
              &#9733;
            </motion.span>
          ))}

          {/* Text */}
          <motion.div
            className="text-center z-10"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 300,
              damping: 12,
            }}
          >
            <motion.p
              className="font-fredoka text-4xl sm:text-5xl font-extrabold"
              style={{
                color: '#FF00E5',
                textShadow:
                  '0 0 20px rgba(255, 0, 229, 0.8), 0 0 40px rgba(255, 0, 229, 0.5), 0 0 80px rgba(255, 0, 229, 0.3)',
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              NOUVEAU RECORD!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
