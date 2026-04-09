import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface AnswerKeypadProps {
  onSubmit: (answer: number) => void;
  disabled?: boolean;
  maxDigits?: number;
  onKeyPress?: (key: string) => void;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['backspace', '0', 'enter'],
];

const KEY_COLORS: Record<string, { border: string; bg: string; shadow: string }> = {
  default: { border: 'rgba(255,255,255,0.2)', bg: 'rgba(255,255,255,0.05)', shadow: 'rgba(255,255,255,0.1)' },
  enter: { border: '#39FF14', bg: 'rgba(57, 255, 20, 0.1)', shadow: 'rgba(57, 255, 20, 0.3)' },
  backspace: { border: '#FF6B00', bg: 'rgba(255, 107, 0, 0.1)', shadow: 'rgba(255, 107, 0, 0.3)' },
};

export const AnswerKeypad: React.FC<AnswerKeypadProps> = ({
  onSubmit,
  disabled = false,
  maxDigits = 3,
  onKeyPress,
}) => {
  const [input, setInput] = useState('');

  const handleKey = useCallback(
    (key: string) => {
      if (disabled) return;

      if (key === 'backspace') {
        setInput((prev) => prev.slice(0, -1));
      } else if (key === 'enter') {
        if (input.length > 0) {
          onSubmit(parseInt(input, 10));
          setInput('');
        }
      } else {
        setInput((prev) => {
          if (prev.length >= maxDigits) return prev;
          return prev + key;
        });
      }

      onKeyPress?.(key);
    },
    [disabled, input, maxDigits, onSubmit, onKeyPress]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key >= '0' && e.key <= '9') {
        handleKey(e.key);
      } else if (e.key === 'Backspace') {
        handleKey('backspace');
      } else if (e.key === 'Enter') {
        handleKey('enter');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKey, disabled]);

  // Reset input when disabled changes (new question)
  useEffect(() => {
    if (!disabled) {
      setInput('');
    }
  }, [disabled]);

  const getKeyLabel = (key: string) => {
    if (key === 'backspace') return '⌫';
    if (key === 'enter') return '✓';
    return key;
  };

  const getKeyColors = (key: string) => {
    if (key === 'enter') return KEY_COLORS.enter;
    if (key === 'backspace') return KEY_COLORS.backspace;
    return KEY_COLORS.default;
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Display */}
      <div
        className="mb-4 h-16 flex items-center justify-center rounded-xl border-2 backdrop-blur-md"
        style={{
          borderColor: 'rgba(0, 245, 255, 0.3)',
          backgroundColor: 'rgba(0, 245, 255, 0.05)',
          boxShadow: '0 0 15px rgba(0, 245, 255, 0.2), inset 0 0 10px rgba(0, 245, 255, 0.1)',
        }}
      >
        <span
          className="font-fredoka text-4xl font-bold text-white tabular-nums"
          style={{ textShadow: '0 0 15px rgba(0, 245, 255, 0.6)' }}
        >
          {input || (
            <span className="text-white/30">...</span>
          )}
        </span>
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.flat().map((key, i) => {
          const colors = getKeyColors(key);
          return (
            <motion.button
              key={key}
              onClick={() => handleKey(key)}
              disabled={disabled}
              className="font-fredoka text-xl font-bold text-white min-h-[64px]
                rounded-xl border-2 backdrop-blur-md
                cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.bg,
                boxShadow: `0 0 8px ${colors.shadow}`,
                borderRadius: '12px',
              }}
              whileHover={!disabled ? { scale: 1.05 } : undefined}
              whileTap={!disabled ? { scale: 0.92 } : undefined}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: i * 0.03,
                type: 'spring',
                stiffness: 400,
                damping: 17,
              }}
            >
              {getKeyLabel(key)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
