import { useEffect, useCallback } from 'react';

interface UseKeyboardOptions {
  onDigit: (digit: number) => void;
  onEnter: () => void;
  onBackspace: () => void;
  enabled: boolean;
}

export function useKeyboard({ onDigit, onEnter, onBackspace, enabled }: UseKeyboardOptions): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        onDigit(parseInt(e.key, 10));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onEnter();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      }
    },
    [enabled, onDigit, onEnter, onBackspace]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}
