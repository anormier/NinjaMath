import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleEffect } from '../ui/ParticleEffect';

export interface BeatDadAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export const BeatDadAnimation: React.FC<BeatDadAnimationProps> = ({
  show,
  onComplete,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Fireworks background */}
          <ParticleEffect type="fireworks" active={show} duration={3000} count={30} />

          {/* Content */}
          <motion.div
            className="text-center z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 250,
              damping: 12,
            }}
          >
            {/* Trophy */}
            <motion.span
              className="text-7xl block mb-4"
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              🏆
            </motion.span>

            {/* Main text */}
            <motion.p
              className="font-fredoka text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight"
              style={{
                color: '#FF00E5',
                textShadow:
                  '0 0 20px rgba(255, 0, 229, 0.8), 0 0 40px rgba(255, 0, 229, 0.5), 0 0 80px rgba(255, 0, 229, 0.3), 0 0 120px rgba(255, 0, 229, 0.2)',
              }}
              animate={{
                textShadow: [
                  '0 0 20px rgba(255, 0, 229, 0.8), 0 0 40px rgba(255, 0, 229, 0.5), 0 0 80px rgba(255, 0, 229, 0.3)',
                  '0 0 30px rgba(0, 245, 255, 0.8), 0 0 60px rgba(0, 245, 255, 0.5), 0 0 100px rgba(0, 245, 255, 0.3)',
                  '0 0 20px rgba(255, 0, 229, 0.8), 0 0 40px rgba(255, 0, 229, 0.5), 0 0 80px rgba(255, 0, 229, 0.3)',
                ],
                scale: [1, 1.03, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              TU AS BATTU PAPA!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
