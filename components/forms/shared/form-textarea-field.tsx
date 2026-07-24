import type { UseFormRegisterReturn } from "react-hook-form";

import { FormFieldError } from "@/components/forms/shared/form-field-error";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const textareaClass =
  "border-[color:var(--field-border)] bg-[var(--field-bg)] text-foreground placeholder:text-muted-foreground";

export function FormTextareaField({
  id,
  label,
  registration,
  error,
  helper,
  placeholder,
  rows = 3,
  maxLength,
  className,
}: {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  helper?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className="space-y-2" data-form-field>
      <div className="flex min-h-5 items-start justify-between gap-3">
        <Label htmlFor={id} className="min-w-0">
          {label}
        </Label>
        <FormFieldError
          id={errorId}
          message={error}
          className="max-w-[62%] shrink-0 text-right leading-5"
        />
      </div>
      <Textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        className={cn(textareaClass, className)}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [helper ? helperId : "", error ? errorId : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
        placeholder={placeholder}
        {...registration}
      />
      {helper ? (
        <p id={helperId} className="text-xs leading-5 text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
