import type { ButtonHTMLAttributes } from "react";

import type { ButtonVariantProps } from "@/components/ui/button-variants";

export type ButtonProps = {
  asChild?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariantProps;
