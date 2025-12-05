import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            i < current
              ? "bg-success scale-100"
              : i === current
              ? "bg-primary scale-125 animate-pulse-glow"
              : "bg-secondary"
          )}
        />
      ))}
    </div>
  );
};
