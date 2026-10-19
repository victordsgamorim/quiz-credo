import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Glossy game pills (the .badge-game styles in index.css)
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "badge-game badge-game-gold",
        success: "badge-game badge-game-success",
        secondary: "badge-game badge-game-navy",
        destructive: "badge-game badge-game-destructive",
        outline: "badge-game badge-game-outline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = {} & React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

/*
 * Badge component for displaying status labels and tags.
 */
const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
