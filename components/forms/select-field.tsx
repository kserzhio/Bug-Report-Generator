"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type Option = {
  label: string;
  value: string;
};

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, options, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
);

SelectField.displayName = "SelectField";

