import { cn } from '@/lib/utils';

interface TimerProps {
  timeLeft: number;
  progress: number;
  isLowTime: boolean;
  isCriticalTime: boolean;
}

export const Timer = ({ timeLeft, progress, isLowTime, isCriticalTime }: TimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground font-medium">Tempo restante</span>
        <span 
          className={cn(
            "text-2xl font-bold font-display transition-colors duration-300",
            isCriticalTime ? "text-destructive animate-pulse" : 
            isLowTime ? "text-primary" : "text-foreground"
          )}
        >
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear rounded-full",
            isCriticalTime ? "bg-destructive" : 
            isLowTime ? "bg-primary" : "bg-accent"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
