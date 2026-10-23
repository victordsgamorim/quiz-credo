import { useEffect, useRef, useState } from "react";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import type { AdminAway } from "@/hooks/useSocket";

type AdminAwayDialogProps = {
  // While the room's admin is away: when the room closes; null while the admin is here
  adminAway: AdminAway | null;
  onLeave: () => void;
};

type ClockState = "normal" | "low" | "critical";

// The room's countdown turns gold, then red, as its time runs out, like the question's countdown
const LOW_SECONDS = 20;
const CRITICAL_SECONDS = 10;
// How often the countdown moves: often enough for the ring to drain smoothly
const TICK_MS = 250;
// The ring around the host, in the units of its SVG (100 wide)
const RING_RADIUS = 45;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
// The host wondering where the admin went. Players already saw it on the rules screen
const HOST_SRC = `${import.meta.env.BASE_URL}assets/characters/ss-question.png`;

// As the question's countdown shows the time
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

// The time, again every TICK_MS while the countdown runs
const useNow = (isRunning: boolean) => {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!isRunning) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, [isRunning]);

  return now;
};

/*
 * Shown to the players while the room's admin is away: the game is paused, and the room closes
 * when the countdown runs out unless the admin is back first. Nothing closes it and nothing behind
 * it works: the player waits, or leaves the room. The paused game turns gray behind it (the
 * .overlay-paused and .room-clock styles in index.css).
 */
export const AdminAwayDialog = ({ adminAway, onLeave }: AdminAwayDialogProps) => {
  const { t } = useLocale();
  const strings = t.quiz.adminAway;
  const contentRef = useRef<HTMLDivElement>(null);
  // The countdown stays through the closing animation, once the admin is back
  const lastAdminAwayRef = useRef(adminAway);
  if (adminAway) lastAdminAwayRef.current = adminAway;
  const shownAdminAway = adminAway ?? lastAdminAwayRef.current;
  const now = useNow(adminAway !== null);

  return (
    <AlertDialog.Root open={adminAway !== null}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="overlay-game overlay-paused fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-500 data-[state=open]:duration-500" />
        <AlertDialog.Content
          ref={contentRef}
          // Only the admin coming back, or the room closing, ends the pause
          onEscapeKeyDown={(event) => event.preventDefault()}
          // The dialog takes the focus, not the button: a key pressed out of habit doesn't leave
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            contentRef.current?.focus();
          }}
          className="dialog-game z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col items-center glass-card rounded-2xl px-6 pb-6 pt-7 text-center outline-none"
        >
          {shownAdminAway && <RoomClock adminAway={shownAdminAway} now={now} />}
          <AlertDialog.Title className="mt-8 font-display text-xl font-extrabold text-balance sm:text-2xl">
            {strings.title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground text-pretty">
            {strings.description}
          </AlertDialog.Description>
          <Button
            variant="outline"
            onClick={onLeave}
            className="mt-6 h-12 w-full text-base font-display font-extrabold"
          >
            <LogOut aria-hidden="true" />
            {strings.leave}
          </Button>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

// The room's countdown: a ring that drains around the host, gray like the paused game, with the
// time left on a tab under it, and a signal that keeps searching for the admin
const RoomClock = ({ adminAway, now }: { adminAway: AdminAway; now: number }) => {
  const { t } = useLocale();
  const msLeft = Math.max(0, adminAway.closesAt - now);
  const secondsLeft = Math.ceil(msLeft / 1000);
  const progress = Math.min(1, msLeft / adminAway.timeoutMs);
  const state: ClockState =
    secondsLeft <= CRITICAL_SECONDS ? "critical" : secondsLeft <= LOW_SECONDS ? "low" : "normal";
  const time = formatTime(secondsLeft);

  return (
    <div className="room-clock relative h-36 w-36 shrink-0 sm:h-40 sm:w-40" data-state={state}>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="room-clock-ring absolute inset-0">
        <circle cx="50" cy="50" r={RING_RADIUS} className="room-clock-track" />
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          className="room-clock-fill"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - progress)}
        />
      </svg>
      <div className="room-clock-host">
        <img src={HOST_SRC} alt="" decoding="async" />
      </div>
      <SearchingSignal />
      <span
        role="timer"
        aria-label={interpolate(t.quiz.adminAway.timeLeft, { time })}
        className="room-clock-time"
      >
        {/* Keyed: pops every second at the end, like the question's countdown */}
        <span key={secondsLeft} className="countdown-tick inline-block">
          {time}
        </span>
      </span>
    </div>
  );
};

// The admin's signal, searched for until they're back: its arcs light up one after the other,
// outwards
const SearchingSignal = () => (
  <span aria-hidden="true" className="room-clock-signal">
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="18.5" r="1.75" />
      <path d="M8.46 14.96A5 5 0 0 1 15.54 14.96" />
      <path d="M5.64 12.14A9 9 0 0 1 18.36 12.14" />
      <path d="M2.81 9.31A13 13 0 0 1 21.19 9.31" />
    </svg>
  </span>
);
