import type { Variants } from 'framer-motion';

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 60, rotate: 3 },
  animate: { opacity: 1, x: 0, rotate: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -60, rotate: -3, transition: { duration: 0.2 } },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 15 } },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.15 } },
};

export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 15 } },
};

export const bounceScale: Variants = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.3, 1], transition: { duration: 0.4 } },
};

export const floatUp: Variants = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: { opacity: 0, y: -80, scale: 1.5, transition: { duration: 1, ease: 'easeOut' } },
};

export const screenTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      '0 0 5px currentColor',
      '0 0 20px currentColor, 0 0 40px currentColor',
      '0 0 5px currentColor',
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

export const shakeAnimation: Variants = {
  shake: {
    x: [0, -8, 8, -4, 4, 0],
    transition: { duration: 0.3 },
  },
};
