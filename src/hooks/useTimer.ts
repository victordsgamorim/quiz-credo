import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerProps {
  duration: number; // in seconds
  onTimeUp: (elapsed: number) => void;
  isActive: boolean;
}

export const useTimer = ({ duration, onTimeUp, isActive }: UseTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(true);
    startTimeRef.current = Date.now();
  }, [duration]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setTimeLeft(duration);
  }, [duration, stop]);

  const getElapsedTime = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  useEffect(() => {
    if (isActive) {
      start();
    } else {
      reset();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stop();
          onTimeUp(duration);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, duration, onTimeUp, stop]);

  const progress = (timeLeft / duration) * 100;
  const isLowTime = timeLeft <= 10;
  const isCriticalTime = timeLeft <= 5;

  return {
    timeLeft,
    progress,
    isLowTime,
    isCriticalTime,
    isRunning,
    start,
    stop,
    reset,
    getElapsedTime,
  };
};
