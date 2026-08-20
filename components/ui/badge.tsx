import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
  {
    variants: {
      variant: {
        default: "border-blue-400/20 bg-blue-500/10 text-[#d7e8ff]",
        accent: "border-accent/45 bg-accent/20 text-[#d7e8ff] shadow-[0_0_24px_rgba(46,119,255,0.14)]",
        primary: "border-primary/45 bg-primary/20 text-[#f1d1db] shadow-[0_0_24px_rgba(159,18,57,0.14)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
