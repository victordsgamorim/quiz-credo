import { cva, type VariantProps } from "class-variance-authority";

// The solid variants are game buttons (the .btn-game styles in index.css), in the colors of the
// streak bar and the countdown
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform,filter] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-game btn-game-gold bg-primary",
        success: "btn-game btn-game-success bg-success",
        destructive: "btn-game btn-game-destructive bg-destructive",
        outline: "btn-game btn-game-navy border",
        secondary: "btn-game btn-game-blue bg-accent",
        ghost: "hover:bg-primary/10 hover:text-primary active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "btn-game-sm h-9 rounded-lg px-3",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
