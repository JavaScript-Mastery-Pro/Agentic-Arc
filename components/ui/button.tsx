import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium shadow-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-brand-foreground hover:bg-brand-hover",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent-hover",
        danger:
          "border border-danger-border bg-danger text-danger-foreground hover:border-danger-border-hover hover:bg-danger-hover hover:text-danger-foreground-hover",
        secondary:
          "border border-surface-border bg-surface text-copy-primary hover:border-surface-border-strong hover:bg-surface-hover",
        ghost:
          "text-copy-secondary hover:bg-surface-hover hover:text-copy-primary",
        outline:
          "border border-surface-border bg-transparent text-copy-secondary hover:border-surface-border-strong hover:bg-surface",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-2xl px-5",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
