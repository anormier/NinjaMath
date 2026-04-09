import React from 'react';
import { motion } from 'framer-motion';
import type { Screen } from '../../types';
import { screenTransition, staggerContainer, staggerItem } from '../../hooks/useAnimation';
import { Button } from '../ui/Button';

interface ModeSelectScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({ onNavigate }) => {
  return (
    <motion.div
      className="flex flex-col min-h-full px-4 py-6 gap-6"
      variants={screenTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('home')}>
          ← Retour
        </Button>
        <h1
          className="font-bungee text-3xl neon-text-cyan"
          style={{ textShadow: '0 0 15px #00F5FF' }}
        >
          Choisis ton mode !
        </h1>
      </div>

      {/* Mode cards */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 flex-1 items-stretch justify-center mt-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* MAX POWER card */}
        <motion.button
          variants={staggerItem}
          onClick={() => onNavigate('game')}
          className="flex-1 flex flex-col items-center justify-center gap-4
            p-8 rounded-3xl backdrop-blur-md border-2 cursor-pointer select-none
            min-h-[200px] sm:min-h-[300px]"
          style={{
            borderColor: '#00F5FF',
            backgroundColor: 'rgba(0, 245, 255, 0.08)',
            boxShadow:
              '0 0 20px rgba(0, 245, 255, 0.2), inset 0 0 20px rgba(0, 245, 255, 0.05)',
          }}
          whileHover={{
            boxShadow:
              '0 0 40px rgba(0, 245, 255, 0.4), inset 0 0 30px rgba(0, 245, 255, 0.1)',
            scale: 1.02,
          }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.span
            className="text-5xl"
            animate={{
              scale: [1, 1.2, 1],
              filter: [
                'drop-shadow(0 0 5px #00F5FF)',
                'drop-shadow(0 0 15px #00F5FF)',
                'drop-shadow(0 0 5px #00F5FF)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⚡
          </motion.span>
          <span
            className="font-bungee text-2xl sm:text-3xl"
            style={{ color: '#00F5FF', textShadow: '0 0 15px #00F5FF' }}
          >
            MAX POWER
          </span>
          <p className="font-quicksand text-white/70 text-center text-sm sm:text-base">
            Commence par la table de 2 et débloque-les toutes !
          </p>
        </motion.button>

        {/* JE CONNAIS CETTE TABLE card */}
        <motion.button
          variants={staggerItem}
          onClick={() => onNavigate('table_select')}
          className="flex-1 flex flex-col items-center justify-center gap-4
            p-8 rounded-3xl backdrop-blur-md border-2 cursor-pointer select-none
            min-h-[200px] sm:min-h-[300px]"
          style={{
            borderColor: '#FF00E5',
            backgroundColor: 'rgba(255, 0, 229, 0.08)',
            boxShadow:
              '0 0 20px rgba(255, 0, 229, 0.2), inset 0 0 20px rgba(255, 0, 229, 0.05)',
          }}
          whileHover={{
            boxShadow:
              '0 0 40px rgba(255, 0, 229, 0.4), inset 0 0 30px rgba(255, 0, 229, 0.1)',
            scale: 1.02,
          }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.span
            className="text-5xl"
            animate={{
              scale: [1, 1.15, 1],
              filter: [
                'drop-shadow(0 0 5px #FF00E5)',
                'drop-shadow(0 0 15px #FF00E5)',
                'drop-shadow(0 0 5px #FF00E5)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          >
            🎯
          </motion.span>
          <span
            className="font-bungee text-xl sm:text-2xl text-center"
            style={{ color: '#FF00E5', textShadow: '0 0 15px #FF00E5' }}
          >
            JE CONNAIS CETTE TABLE !
          </span>
          <p className="font-quicksand text-white/70 text-center text-sm sm:text-base">
            Choisis ta table et entraîne-toi !
          </p>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
