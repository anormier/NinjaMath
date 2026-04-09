import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface WrongAnimationProps {
  show: boolean;
  correctAnswer: number;
  onComplete?: () => void;
}

const ENCOURAGING_TEXTS = [
  'Presque ! Continue !',
  'Pas grave, tu vas y arriver !',
  'La prochaine sera la bonne !',
  'Tu progresses, continue !',
  'Allez, on lache rien !',
  'C\'est en se trompant qu\'on apprend !',
  'Courage, tu es sur la bonne voie !',
  'Essaie encore, tu peux le faire !',
];

export const WrongAnimation: React.FC<WrongAnimationProps> = ({
  show,
  correctAnswer,
  onComplete,
}) => {
  const encouragingText = useMemo(
    () => ENCOURAGING_TEXTS[Math.floor(Math.random() * ENCOURAGING_TEXTS.length)],
    [show]
  );

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
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
          transition={{ duration: 0.2 }}
        >
          {/* Red flash overlay */}
          <motion.div
            className="absolute inset-0 bg-red-600"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />

          {/* Correct answer */}
          <motion.div
            className="text-center z-10"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <p
              className="font-fredoka text-lg text-white/70 mb-2"
            >
              La reponse etait
            </p>
            <p
              className="font-fredoka text-6xl font-extrabold text-white mb-4"
              style={{
                textShadow: '0 0 20px rgba(255, 68, 68, 0.6)',
              }}
            >
              {correctAnswer}
            </p>
            <motion.p
              className="font-fredoka text-xl text-cyan-300"
              style={{
                textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {encouragingText}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
