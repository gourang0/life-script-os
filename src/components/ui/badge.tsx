import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-105",
        secondary: "border-transparent bg-secondary/20 text-secondary-foreground hover:bg-secondary/30",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground hover:bg-accent/10",
        success: "border-transparent bg-green-500/20 text-green-600 dark:text-green-400",
        warning: "border-transparent bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
        glow: "border-transparent bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_15px_hsl(var(--primary)/0.6)]",
        gradient: "border-transparent gradient-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
