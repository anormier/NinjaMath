import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerReturn {
  elapsedMs: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  getElapsed: () => number;
}

export function useTimer(): UseTimerReturn {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = performance.now();
    setElapsedMs(accumulatedRef.current + (now - startTimeRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    accumulatedRef.current += performance.now() - startTimeRef.current;
    setElapsedMs(accumulatedRef.current);
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    accumulatedRef.current = 0;
    startTimeRef.current = 0;
    setElapsedMs(0);
    setIsRunning(false);
  }, []);

  const getElapsed = useCallback(() => {
    if (isRunning) {
      return accumulatedRef.current + (performance.now() - startTimeRef.current);
    }
    return accumulatedRef.current;
  }, [isRunning]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { elapsedMs, isRunning, start, stop, reset, getElapsed };
}
