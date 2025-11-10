import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useState, useEffect } from "react";

interface PropertyInputProps {
  id: string;
  label: string;
  value: number | string;
  type?: "number" | "text";
  step?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  validation?: z.ZodSchema;
  onChange?: (value: number | string) => void;
  onBlur?: () => void;
  className?: string;
  helpText?: string;
}

/**
 * Reusable property input component with validation and visual feedback.
 * Features:
 * - Zod schema validation
 * - Red border on invalid input
 * - Value clamping for numeric inputs
 * - Real-time validation feedback
 */
export function PropertyInput({
  id,
  label,
  value,
  type = "number",
  step,
  min,
  max,
  disabled = false,
  validation,
  onChange,
  onBlur,
  className,
  helpText,
}: PropertyInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      type === "number" ? parseFloat(e.target.value) : e.target.value;
    setLocalValue(e.target.value);

    // Validate if schema provided
    if (validation) {
      const result = validation.safeParse(newValue);
      if (!result.success) {
        setError(result.error.errors[0]?.message || "Invalid value");
      } else {
        setError(null);
        onChange?.(newValue);
      }
    } else {
      setError(null);
      onChange?.(newValue);
    }
  };

  const handleBlur = () => {
    if (type === "number") {
      let numValue = parseFloat(localValue as string);

      // Clamp to min/max if provided
      if (min !== undefined) {
        numValue = Math.max(numValue, parseFloat(min));
      }
      if (max !== undefined) {
        numValue = Math.min(numValue, parseFloat(max));
      }

      // Check if value is finite
      if (!isFinite(numValue)) {
        numValue = typeof value === "number" ? value : 0;
        setError("Value must be a finite number");
      } else {
        setError(null);
      }

      setLocalValue(numValue);
      onChange?.(numValue);
    }

    onBlur?.();
  };

  const hasError = error !== null;

  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={localValue}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(hasError && "border-red-500 focus-visible:ring-red-500")}
        aria-invalid={hasError}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
