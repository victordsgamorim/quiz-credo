import { useTimer } from "@/hooks/useTimer";

export type TimerState = {
  timeLeft: number;
  progress: number;
  isLowTime: boolean;
  isCriticalTime: boolean;
};

type UseGameTimerStateProps = {
  isShowingFeedback: boolean;
  onSubmitAnswer: (elapsedTime: number) => void;
  duration: number;
};

export const useGameTimerState = ({
  isShowingFeedback,
  onSubmitAnswer,
  duration,
}: UseGameTimerStateProps) => {
  const handleTimeUp = (elapsed: number) => {
    if (!isShowingFeedback) {
      onSubmitAnswer(elapsed);
    }
  };

  const { timeLeft, progress, isLowTime, isCriticalTime, getElapsedTime, stop } = useTimer({
    duration,
    onTimeUp: handleTimeUp,
    isActive: !isShowingFeedback,
  });

  const handleSubmit = () => {
    stop();
    onSubmitAnswer(getElapsedTime());
  };

  return {
    timerState: { timeLeft, progress, isLowTime, isCriticalTime } satisfies TimerState,
    handleSubmit,
  };
};
