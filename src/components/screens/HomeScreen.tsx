import React from 'react';
import { motion } from 'framer-motion';
import type { Screen } from '../../types';
import { screenTransition } from '../../hooks/useAnimation';
import { useUserStore } from '../../stores/userStore';
import { Button } from '../ui/Button';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const activeProfile = useUserStore((s) => s.getActiveProfile());

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-full px-4 py-8 gap-6"
      variants={screenTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Lightning bolt animated */}
      <motion.span
        className="text-6xl"
        animate={{
          rotate: [0, -10, 10, -5, 5, 0],
          scale: [1, 1.2, 1, 1.1, 1],
          filter: [
            'drop-shadow(0 0 8px #00F5FF)',
            'drop-shadow(0 0 20px #FFD700)',
            'drop-shadow(0 0 8px #00F5FF)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        ⚡
      </motion.span>

      {/* Logo */}
      <motion.h1
        className="font-bungee text-5xl sm:text-7xl neon-text-cyan select-none"
        style={{
          textShadow:
            '0 0 10px #00F5FF, 0 0 30px #00F5FF, 0 0 60px #00F5FF, 0 0 100px #00F5FF',
        }}
        initial={{ opacity: 0, scale: 0.5, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
      >
        MATHBLITZ
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="font-quicksand text-lg sm:text-xl text-white/80"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Deviens le roi du calcul !
      </motion.p>

      {/* Play button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
      >
        <Button
          variant="cyan"
          size="xl"
          pulsing
          onClick={() => onNavigate('mode_select')}
          className="font-bungee text-2xl tracking-wider px-16"
        >
          JOUER
        </Button>
      </motion.div>

      {/* Active profile display */}
      <motion.div
        className="flex flex-col items-center gap-3 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {activeProfile ? (
          <motion.button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-md
              border border-white/20 bg-white/5 cursor-pointer select-none"
            whileHover={{
              borderColor: '#00F5FF',
              backgroundColor: 'rgba(0, 245, 255, 0.1)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">{activeProfile.avatar}</span>
            <span className="font-quicksand text-white font-semibold">
              {activeProfile.name}
            </span>
          </motion.button>
        ) : (
          <Button
            variant="ghost"
            size="md"
            onClick={() => onNavigate('profile')}
          >
            Crée ton profil !
          </Button>
        )}
      </motion.div>

      {/* Leaderboard button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          variant="ghost"
          size="md"
          onClick={() => onNavigate('leaderboard')}
        >
          🏆 Classement
        </Button>
      </motion.div>
    </motion.div>
  );
};
