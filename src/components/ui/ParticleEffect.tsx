import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NEON_COLORS } from '../../types';

export interface ParticleEffectProps {
  type: 'confetti' | 'stars' | 'fireworks';
  active: boolean;
  duration?: number;
  count?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  shape: 'square' | 'circle';
  rotation: number;
  delay: number;
}

const generateParticles = (
  type: ParticleEffectProps['type'],
  count: number
): Particle[] => {
  const colors = [...NEON_COLORS, '#FFD700', '#FF4444', '#FFFFFF'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: type === 'fireworks' ? 50 + (Math.random() - 0.5) * 20 : Math.random() * 100,
    y: type === 'stars' ? 50 : type === 'fireworks' ? 50 : -10,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
    rotation: Math.random() * 360,
    delay: Math.random() * 0.5,
  }));
};

const ConfettiParticle: React.FC<{ particle: Particle }> = ({ particle }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.color,
      borderRadius: particle.shape === 'circle' ? '50%' : '2px',
    }}
    initial={{ opacity: 1, y: 0, rotate: 0 }}
    animate={{
      y: [0, window.innerHeight],
      x: [0, (Math.random() - 0.5) * 200],
      rotate: particle.rotation + Math.random() * 720,
      opacity: [1, 1, 0],
    }}
    exit={{ opacity: 0 }}
    transition={{
      duration: 2 + Math.random(),
      delay: particle.delay,
      ease: 'easeIn',
    }}
  />
);

const StarParticle: React.FC<{ particle: Particle }> = ({ particle }) => {
  const angle = (particle.id / 20) * Math.PI * 2;
  const distance = 150 + Math.random() * 200;
  return (
    <motion.div
      className="absolute pointer-events-none text-xl"
      style={{
        left: '50%',
        top: '50%',
        color: particle.color,
        textShadow: `0 0 10px ${particle.color}`,
      }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: [0, 1.5, 0],
        opacity: [1, 1, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.2,
        delay: particle.delay * 0.3,
        ease: 'easeOut',
      }}
    >
      &#9733;
    </motion.div>
  );
};

const FireworkParticle: React.FC<{ particle: Particle }> = ({ particle }) => {
  const angle = (particle.id / 20) * Math.PI * 2 + Math.random() * 0.5;
  const distance = 100 + Math.random() * 250;
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
        boxShadow: `0 0 6px ${particle.color}, 0 0 12px ${particle.color}`,
      }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 50,
        scale: [0, 1, 0.3],
        opacity: [1, 1, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.5,
        delay: particle.delay * 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    />
  );
};

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  type,
  active,
  duration = 2000,
  count = 20,
}) => {
  const [visible, setVisible] = useState(active);
  const particles = useMemo(
    () => (active ? generateParticles(type, count) : []),
    [active, type, count]
  );

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [active, duration]);

  const ParticleComponent =
    type === 'confetti'
      ? ConfettiParticle
      : type === 'stars'
        ? StarParticle
        : FireworkParticle;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 pointer-events-none overflow-hidden z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((p) => (
            <ParticleComponent key={p.id} particle={p} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
