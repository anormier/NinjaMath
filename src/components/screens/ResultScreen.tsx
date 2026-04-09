import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Screen, InputMode } from '../../types';
import { screenTransition, staggerContainer, staggerItem } from '../../hooks/useAnimation';
import { useGameStore } from '../../stores/gameStore';
import { Button } from '../ui/Button';
import { ParticleEffect } from '../ui/ParticleEffect';

interface ResultScreenProps {
  onNavigate: (screen: Screen) => void;
}

const INPUT_MODE_LABELS: Record<InputMode, string> = {
  qcm4: 'QCM4',
  qcm3: 'QCM3',
  qcm2: 'QCM2',
  keypad: 'Clavier',
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const ResultScreen: React.FC<ResultScreenProps> = ({ onNavigate }) => {
  const sessionResult = useGameStore((s) => s.sessionResult);
  const resetGame = useGameStore((s) => s.resetGame);

  const [displayedScore, setDisplayedScore] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  // Score count-up animation
  useEffect(() => {
    if (!sessionResult) return;

    const targetScore = sessionResult.totalScore;
    if (targetScore === 0) {
      setDisplayedScore(0);
      return;
    }

    const duration = 1500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(targetScore * eased));

      if (progress >= 1) {
        clearInterval(interval);
        setShowParticles(true);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [sessionResult]);

  if (!sessionResult) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-full"
        variants={screenTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <p className="font-quicksand text-white/70">Pas de résultats</p>
        <Button variant="cyan" size="md" onClick={() => onNavigate('home')}>
          Accueil
        </Button>
      </motion.div>
    );
  }

  const totalAnswers = sessionResult.answers.length;
  const qcmAnswers = sessionResult.answers.filter((a) => a.inputMode !== 'keypad').length;
  const keypadAnswers = sessionResult.answers.filter((a) => a.inputMode === 'keypad').length;
  const accuracy = totalAnswers > 0 ? Math.round((sessionResult.correctCount / totalAnswers) * 100) : 0;

  const handleReplay = () => {
    resetGame();
    onNavigate('game');
  };

  const handleChangeTable = () => {
    resetGame();
    onNavigate('table_select');
  };

  const handleHome = () => {
    resetGame();
    onNavigate('home');
  };

  return (
    <motion.div
      className="flex flex-col min-h-full px-4 py-6 gap-6 items-center"
      variants={screenTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Celebration particles */}
      <ParticleEffect
        type={sessionResult.isNewRecord ? 'fireworks' : sessionResult.beatDad ? 'stars' : 'confetti'}
        active={showParticles}
        duration={3000}
        count={30}
      />

      {/* Title */}
      <motion.h1
        className="font-bungee text-3xl sm:text-4xl text-center"
        style={{
          color: '#00F5FF',
          textShadow: '0 0 15px #00F5FF, 0 0 30px #00F5FF',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Résultats
      </motion.h1>

      {/* New record / Beat dad badges */}
      <AnimatePresence>
        {sessionResult.isNewRecord && (
          <motion.div
            className="px-6 py-3 rounded-2xl border-2"
            style={{
              borderColor: '#FFD700',
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 1.6 }}
          >
            <span
              className="font-bungee text-xl"
              style={{ color: '#FFD700', textShadow: '0 0 10px #FFD700' }}
            >
              🏅 NOUVEAU RECORD !
            </span>
          </motion.div>
        )}
        {sessionResult.beatDad && (
          <motion.div
            className="px-6 py-3 rounded-2xl border-2"
            style={{
              borderColor: '#FF00E5',
              backgroundColor: 'rgba(255, 0, 229, 0.1)',
              boxShadow: '0 0 20px rgba(255, 0, 229, 0.3)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 1.8 }}
          >
            <span
              className="font-bungee text-xl"
              style={{ color: '#FF00E5', textShadow: '0 0 10px #FF00E5' }}
            >
              👑 TU AS BATTU PAPA !
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated score */}
      <motion.div
        className="flex flex-col items-center gap-1"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="font-quicksand text-white/60 text-sm">Score</span>
        <motion.span
          className="font-bungee text-5xl sm:text-6xl"
          style={{
            color: '#00F5FF',
            textShadow: '0 0 20px #00F5FF, 0 0 40px #00F5FF',
          }}
        >
          {displayedScore.toLocaleString()}
        </motion.span>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl backdrop-blur-md
            border border-white/15 bg-white/5"
        >
          <span className="text-2xl">⏱️</span>
          <span className="font-fredoka text-lg font-bold text-white">
            {formatTime(sessionResult.totalTime)}
          </span>
          <span className="font-quicksand text-white/50 text-xs">Temps</span>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl backdrop-blur-md
            border border-white/15 bg-white/5"
        >
          <span className="text-2xl">✅</span>
          <span className="font-fredoka text-lg font-bold text-white">
            {sessionResult.correctCount}/{totalAnswers}
          </span>
          <span className="font-quicksand text-white/50 text-xs">{accuracy}% correct</span>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl backdrop-blur-md
            border border-white/15 bg-white/5"
        >
          <span className="text-2xl">🔥</span>
          <span className="font-fredoka text-lg font-bold text-white">
            {sessionResult.maxCombo}
          </span>
          <span className="font-quicksand text-white/50 text-xs">Max combo</span>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl backdrop-blur-md
            border border-white/15 bg-white/5"
        >
          <span className="text-2xl">⌨️</span>
          <span className="font-fredoka text-lg font-bold text-white">
            {keypadAnswers}/{qcmAnswers}
          </span>
          <span className="font-quicksand text-white/50 text-xs">Clavier / QCM</span>
        </motion.div>
      </motion.div>

      {/* Facts progression */}
      {sessionResult.factsProgressed.length > 0 && (
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <h3
            className="font-bungee text-lg mb-3"
            style={{ color: '#39FF14', textShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
          >
            Progressions
          </h3>
          <div className="flex flex-col gap-2">
            {sessionResult.factsProgressed.map((fp, i) => (
              <motion.div
                key={`${fp.a}-${fp.b}-${i}`}
                className="flex items-center gap-3 px-4 py-2 rounded-xl
                  backdrop-blur-md border border-white/10 bg-white/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
              >
                <span className="font-fredoka text-white font-bold">
                  {fp.a} × {fp.b}
                </span>
                <span className="font-quicksand text-white/50 text-sm">
                  {INPUT_MODE_LABELS[fp.from]}
                </span>
                <span
                  className="font-fredoka font-bold"
                  style={{ color: '#39FF14' }}
                >
                  →
                </span>
                <span
                  className="font-quicksand text-sm font-bold"
                  style={{ color: '#39FF14' }}
                >
                  {INPUT_MODE_LABELS[fp.to]}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <Button variant="cyan" size="lg" onClick={handleReplay} className="flex-1">
          🔄 Rejouer
        </Button>
        <Button variant="magenta" size="lg" onClick={handleChangeTable} className="flex-1">
          📋 Changer de table
        </Button>
        <Button variant="ghost" size="lg" onClick={handleHome} className="flex-1">
          🏠 Accueil
        </Button>
      </motion.div>
    </motion.div>
  );
};
