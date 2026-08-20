import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-[44px] items-center justify-center rounded-xl text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform,filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b1c] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#b31845] to-[#7b1235] px-4 py-3 text-white shadow-[0_10px_26px_rgba(126,14,52,0.3)] hover:brightness-110",
        secondary:
          "bg-[#1d3f91] px-4 py-3 text-white shadow-[0_10px_26px_rgba(9,34,99,0.28)] hover:bg-[#2850aa]",
        ghost: "px-3 py-2 text-blue-100/78 hover:bg-white/[0.07] hover:text-white",
        outline:
          "border border-accent/25 bg-gradient-to-br from-[#102554]/80 to-[#681633]/70 px-4 py-3 text-[#f3d3dd] hover:border-primary/40 hover:from-[#13377c] hover:to-[#82163a]",
      },
      size: {
        default: "",
        sm: "rounded-xl px-3 py-2 text-xs",
        lg: "px-5 py-3.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
