"use client";

import { type ReactNode } from "react";
import { type FieldError } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: FieldError;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  hint,
  error,
  children
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      <p
        className={cn(
          "min-h-5 text-xs",
          error ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {error?.message ?? " "}
      </p>
    </div>
  );
}
