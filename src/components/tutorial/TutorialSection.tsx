import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type TutorialSectionProps = {
  title: string;
  description?: ReactNode;
  // The game's own pieces, to see or try out what the section explains
  children?: ReactNode;
};

/*
 * A rule of the game in the tutorial: its name, a few sentences about it, and the game's own pieces
 * showing it.
 */
export const TutorialSection = ({ title, description, children }: TutorialSectionProps) => {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="space-y-3 sm:space-y-4">
      <div className="space-y-1.5">
        <h2 id={titleId} className="font-display text-xl font-extrabold sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-prose text-sm leading-relaxed text-foreground/80 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
};

// The table the game's pieces are laid on: a slot sunk into the page, like the rankings' rows
export const TutorialStage = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("row-game rounded-2xl p-4 sm:p-6", className)}>{children}</div>;
