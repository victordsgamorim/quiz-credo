import { useState, useEffect, useCallback, useRef } from "react";

type UseTimerProps = {
  duration: number; // in seconds
  onTimeUp: (elapsed: number) => void;
  isActive: boolean;
};

/*
 * Hook for managing countdown timers with start, stop, and reset functionality.
 */
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
    clearActiveInterval(intervalRef);
  }, []);

  const reset = useCallback(() => {
    stop();
    setTimeLeft(duration);
  }, [duration, stop]);

  const getElapsedTime = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  useTimerActivation({ isActive, start, reset, intervalRef });
  useCountdownTick({ isRunning, duration, onTimeUp, stop, setTimeLeft, intervalRef });

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

const useTimerActivation = ({
  isActive,
  start,
  reset,
  intervalRef,
}: {
  isActive: boolean;
  start: () => void;
  reset: () => void;
  intervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
}) => {
  useEffect(() => {
    if (isActive) {
      start();
    } else {
      reset();
    }

    return () => clearActiveInterval(intervalRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);
};

const useCountdownTick = ({
  isRunning,
  duration,
  onTimeUp,
  stop,
  setTimeLeft,
  intervalRef,
}: {
  isRunning: boolean;
  duration: number;
  onTimeUp: (elapsed: number) => void;
  stop: () => void;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  intervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
}) => {
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stop();
          onTimeUp(duration);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearActiveInterval(intervalRef);
  }, [isRunning, duration, onTimeUp, stop, setTimeLeft, intervalRef]);
};

const clearActiveInterval = (intervalRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
};
