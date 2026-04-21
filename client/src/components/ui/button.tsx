import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0",
    "font-medium transition-all duration-200 outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:border-ring",
    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
    "rounded-xl",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white shadow-sm hover:opacity-90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent/40 shadow-none",
        secondary:
          "bg-muted/40 text-foreground hover:bg-muted/60 border border-border/50",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-accent/30",
        link:
          "text-primary underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
