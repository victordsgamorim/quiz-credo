import type { ReactNode } from "react";

import * as Tabs from "@radix-ui/react-tabs";
import { Layers, Sparkles, Zap, type LucideIcon } from "lucide-react";

import { useLocale } from "@/contexts/LocaleContext";

import { GameTab } from "./GameTab";
import { PointsTab } from "./PointsTab";
import { PowerUpsTab } from "./PowerUpsTab";

type TutorialContentProps = {
  // The ends of the page's or the dialog's header, around the logo: the way back or out on the
  // left (start), the languages or the way out on the right (end)
  start?: ReactNode;
  end?: ReactNode;
};

type TabId = "game" | "points" | "powerUps";

// The power-ups have a tab of their own, with the sparkles of the lobby's power-ups button; the
// points have the streak bar's lightning
const TABS: { id: TabId; icon: LucideIcon }[] = [
  { id: "game", icon: Layers },
  { id: "points", icon: Zap },
  { id: "powerUps", icon: Sparkles },
];

/*
 * The game's rules, in three tabs: the game itself (the room, the questions, the time, the
 * difficulty and the categories), its points (the streak bar and the ranking) and the power-ups.
 * Each rule comes with the game's own pieces, to see it or try it out. The rules are told without
 * the admin's settings (the time, the points of the power-ups...), which change from room to room.
 */
export const TutorialContent = ({ start, end }: TutorialContentProps) => {
  const { t } = useLocale();
  const strings = t.tutorial;

  return (
    <Tabs.Root defaultValue="game" className="flex flex-1 flex-col">
      {/* Held to the top, like the lobby's header: the ends around the logo, the tabs under them.
          A phone on its side has no height to spare: the tabs take the logo's place */}
      <div className="sticky top-0 z-20 border-b border-primary/10 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-x-2 gap-y-3 px-page py-3 phone-landscape:grid-cols-[minmax(2.25rem,auto)_minmax(0,1fr)_minmax(2.25rem,auto)] phone-landscape:gap-x-3 phone-landscape:py-2">
          <div className="col-start-1 row-start-1 justify-self-start">{start}</div>
          <img
            src="/logo.png"
            alt=""
            className="col-start-2 row-start-1 h-6 w-auto object-contain sm:h-7 phone-landscape:hidden"
          />
          <Tabs.List
            aria-label={strings.tabsLabel}
            className="row-game col-span-3 row-start-2 grid grid-cols-3 gap-1 rounded-full p-1 phone-landscape:col-span-1 phone-landscape:col-start-2 phone-landscape:row-start-1 phone-landscape:mx-auto phone-landscape:w-full phone-landscape:max-w-lg"
          >
            {TABS.map(({ id, icon }) => (
              <Tabs.Trigger
                key={id}
                value={id}
                className="tab-game flex min-h-10 items-center justify-center gap-1.5 rounded-full px-2 font-display text-sm font-extrabold sm:text-base"
              >
                <TabIcon icon={icon} />
                {strings.tabs[id]}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <div className="col-start-3 row-start-1 justify-self-end">{end}</div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 px-page pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:pt-8 phone-landscape:pt-5">
        <TutorialIntro />
        <Tabs.Content value="game" className="tab-panel-game">
          <GameTab />
        </Tabs.Content>
        <Tabs.Content value="points" className="tab-panel-game">
          <PointsTab />
        </Tabs.Content>
        <Tabs.Content value="powerUps" className="tab-panel-game">
          <PowerUpsTab />
        </Tabs.Content>
      </main>
    </Tabs.Root>
  );
};

const TabIcon = ({ icon }: { icon: LucideIcon }) => {
  const Icon = icon;
  return <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />;
};

// The host asking, beside what the game is about
const TutorialIntro = () => {
  const { t } = useLocale();
  const strings = t.tutorial;

  return (
    <div className="mb-8 flex items-center gap-4 sm:mb-10 sm:gap-6">
      <img
        src="/assets/characters/ss-question.png"
        alt=""
        className="h-24 w-auto shrink-0 object-contain image-glow-soft sm:h-32"
      />
      <div className="space-y-1.5">
        <h1 className="gold-text font-display text-3xl font-black leading-tight sm:text-4xl">
          {strings.title}
        </h1>
        <p className="text-sm leading-relaxed sm:text-base">{strings.intro}</p>
      </div>
    </div>
  );
};
