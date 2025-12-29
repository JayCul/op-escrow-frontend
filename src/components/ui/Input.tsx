import React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, rightIcon, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 text-xs",
      md: "h-10 text-sm",
      lg: "h-12 text-base",
    };

    return (
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div className="absolute left-3 top-0 h-full flex items-center text-muted-foreground">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          aria-invalid={!!props["aria-invalid"]}
          className={cn(
            "flex w-full rounded-md border border-input bg-white text-gray-900 border-gray-300 dark:text-foreground ring-offset-background",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
            // Dark mode
            "dark:bg-neutral-900 dark:border-neutral-700 dark:placeholder:text-neutral-500 dark:text-neutral-100",
            "dark:focus-visible:ring-primary",
            sizeClasses[size],
            icon && "pl-10",
            rightIcon && "pr-10",
            !icon && !rightIcon && "px-3",
            className
          )}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <div className="absolute right-3 top-0 h-full flex items-center text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
