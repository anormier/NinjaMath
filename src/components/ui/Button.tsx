import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

const VARIANT_COLORS = {
  cyan: {
    border: '#00F5FF',
    shadow: 'rgba(0, 245, 255, 0.4)',
    bg: 'rgba(0, 245, 255, 0.1)',
    hoverBg: 'rgba(0, 245, 255, 0.2)',
  },
  magenta: {
    border: '#FF00E5',
    shadow: 'rgba(255, 0, 229, 0.4)',
    bg: 'rgba(255, 0, 229, 0.1)',
    hoverBg: 'rgba(255, 0, 229, 0.2)',
  },
  lime: {
    border: '#39FF14',
    shadow: 'rgba(57, 255, 20, 0.4)',
    bg: 'rgba(57, 255, 20, 0.1)',
    hoverBg: 'rgba(57, 255, 20, 0.2)',
  },
  orange: {
    border: '#FF6B00',
    shadow: 'rgba(255, 107, 0, 0.4)',
    bg: 'rgba(255, 107, 0, 0.1)',
    hoverBg: 'rgba(255, 107, 0, 0.2)',
  },
  ghost: {
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'transparent',
    bg: 'rgba(255, 255, 255, 0.05)',
    hoverBg: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm min-h-[48px]',
  md: 'px-5 py-2.5 text-base min-h-[48px]',
  lg: 'px-7 py-3.5 text-lg min-h-[48px]',
  xl: 'px-9 py-5 text-xl min-h-[64px]',
} as const;

export interface ButtonProps {
  variant?: keyof typeof VARIANT_COLORS;
  size?: keyof typeof SIZE_CLASSES;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  pulsing?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'cyan',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
  pulsing = false,
}) => {
  const colors = VARIANT_COLORS[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-fredoka rounded-xl font-semibold
        backdrop-blur-md border-2
        text-white cursor-pointer select-none
        transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      style={{
        borderColor: colors.border,
        backgroundColor: colors.bg,
        boxShadow: `0 0 15px ${colors.shadow}, inset 0 0 15px ${colors.shadow}`,
      }}
      whileHover={
        disabled
          ? undefined
          : {
              boxShadow: `0 0 25px ${colors.shadow}, 0 0 50px ${colors.shadow}, inset 0 0 20px ${colors.shadow}`,
              backgroundColor: colors.hoverBg,
            }
      }
      whileTap={disabled ? undefined : { scale: 0.95 }}
      animate={
        pulsing
          ? {
              boxShadow: [
                `0 0 15px ${colors.shadow}, inset 0 0 15px ${colors.shadow}`,
                `0 0 30px ${colors.shadow}, 0 0 60px ${colors.shadow}, inset 0 0 25px ${colors.shadow}`,
                `0 0 15px ${colors.shadow}, inset 0 0 15px ${colors.shadow}`,
              ],
            }
          : undefined
      }
      transition={
        pulsing
          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 400, damping: 17 }
      }
    >
      {children}
    </motion.button>
  );
};
