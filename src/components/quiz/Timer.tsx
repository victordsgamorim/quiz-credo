import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

type TimerProps = {
  timeLeft: number;
  progress: number;
  isLowTime: boolean;
  isCriticalTime: boolean;
};

/*
 * Timer component displaying countdown with visual progress bar.
 */
export const Timer = ({ timeLeft, progress, isLowTime, isCriticalTime }: TimerProps) => {
  const { t } = useLocale();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="truncate text-sm text-muted-foreground font-medium">
          {t.quiz.timer.label}
        </span>
        <span
          role="timer"
          aria-label={`${t.quiz.timer.label}: ${formatTime(timeLeft)}`}
          className={cn(
            "shrink-0 text-xl sm:text-2xl font-bold font-display tabular-nums transition-colors duration-300",
            isCriticalTime
              ? "text-destructive animate-pulse"
              : isLowTime
                ? "text-primary"
                : "text-foreground"
          )}
        >
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="h-2.5 sm:h-3 bg-secondary rounded-full overflow-hidden" aria-hidden="true">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear rounded-full",
            isCriticalTime ? "bg-destructive" : isLowTime ? "bg-primary" : "bg-accent"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
