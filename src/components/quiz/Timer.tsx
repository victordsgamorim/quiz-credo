import { Timer as StopwatchIcon } from "lucide-react";

import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

type TimerProps = {
  timeLeft: number;
  progress: number;
  isLowTime: boolean;
  isCriticalTime: boolean;
  // Phones: only the time, when the countdown shares its row with buttons (the timer still names it)
  isLabelHiddenOnPhones?: boolean;
};

type CountdownState = "normal" | "low" | "critical";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/*
 * Countdown of the question: a box with the time left inside it that drains as the time runs out.
 * Blue while there's time, gold when it runs low and red when it's almost over, with a shimmer like
 * the streak bar's, a flash every time it changes color and a beat every second at the end (the
 * .countdown styles in index.css).
 */
export const Timer = ({
  timeLeft,
  progress,
  isLowTime,
  isCriticalTime,
  isLabelHiddenOnPhones,
}: TimerProps) => {
  const { t } = useLocale();
  const state: CountdownState = isCriticalTime ? "critical" : isLowTime ? "low" : "normal";
  const labelClass = cn(LABEL_CLASS, isLabelHiddenOnPhones && "max-sm:invisible");
  const content = { label: t.quiz.timer.label, labelClass, time: formatTime(timeLeft), timeLeft };

  return (
    <div
      className="countdown relative h-8 w-full sm:h-9"
      data-state={state}
      data-over={timeLeft <= 0}
    >
      <div className="countdown-track absolute inset-0 overflow-hidden rounded-full">
        <CountdownContent {...content} />
        <div className="countdown-fill h-full rounded-full" style={{ width: `${progress}%` }}>
          <CountdownInk {...content} />
        </div>
        {/* Keyed: every time the countdown changes color, a glare sweeps across it... */}
        {state !== "normal" && <span key={state} aria-hidden="true" className="countdown-glare" />}
      </div>
      {/* ...and it sends out a ring */}
      {state !== "normal" && <span key={state} aria-hidden="true" className="countdown-flash" />}
      {/* Keyed: beats every second at the end */}
      {state === "critical" && timeLeft > 0 && (
        <span key={timeLeft} aria-hidden="true" className="countdown-beat" />
      )}
    </div>
  );
};

type CountdownContentProps = {
  label: string;
  labelClass: string;
  time: string;
  timeLeft: number;
};

const ICON_CLASS = "countdown-icon h-4 w-4 shrink-0 sm:h-5 sm:w-5";
const LABEL_CLASS = "min-w-0 flex-1 truncate text-sm font-semibold";
const TIME_CLASS =
  "countdown-time shrink-0 font-display text-lg font-extrabold tabular-nums sm:text-xl";

// The box's content, as it reads over the empty track
const CountdownContent = ({ label, labelClass, time, timeLeft }: CountdownContentProps) => (
  <div className="countdown-content">
    <StopwatchIcon aria-hidden="true" className={ICON_CLASS} />
    <span className={labelClass}>{label}</span>
    <span role="timer" aria-label={`${label}: ${time}`} className={TIME_CLASS}>
      {/* Keyed: pops every second at the end */}
      <span key={timeLeft} className="countdown-tick inline-block">
        {time}
      </span>
    </span>
  </div>
);

// The fill's copy of the content, in dark ink so it reads on both sides of the fill's edge. Its
// text comes from data-text (index.css), so the page only has the text once
const CountdownInk = ({ label, labelClass, time, timeLeft }: CountdownContentProps) => (
  <div aria-hidden="true" className="countdown-content countdown-ink">
    <StopwatchIcon className={ICON_CLASS} />
    <span className={labelClass} data-text={label} />
    <span className={TIME_CLASS}>
      <span key={timeLeft} className="countdown-tick inline-block" data-text={time} />
    </span>
  </div>
);
