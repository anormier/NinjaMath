import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LevelUpAnimationProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  show,
  message,
  onComplete,
}) => {
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
          {/* Rocket flying diagonally */}
          <motion.span
            className="absolute text-6xl"
            initial={{ x: '-50vw', y: '50vh', rotate: -45 }}
            animate={{ x: '50vw', y: '-50vh', rotate: -45 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            🚀
          </motion.span>

          {/* Message */}
          <motion.div
            className="text-center z-10"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }}
          >
            <motion.p
              className="font-fredoka text-4xl sm:text-5xl font-extrabold text-white"
              style={{
                textShadow:
                  '0 0 20px rgba(0, 245, 255, 0.8), 0 0 40px rgba(0, 245, 255, 0.4), 0 0 60px rgba(0, 245, 255, 0.2)',
              }}
              animate={{
                textShadow: [
                  '0 0 20px rgba(0, 245, 255, 0.8), 0 0 40px rgba(0, 245, 255, 0.4)',
                  '0 0 30px rgba(255, 0, 229, 0.8), 0 0 60px rgba(255, 0, 229, 0.4)',
                  '0 0 20px rgba(0, 245, 255, 0.8), 0 0 40px rgba(0, 245, 255, 0.4)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
