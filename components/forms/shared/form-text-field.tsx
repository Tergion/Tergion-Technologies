import type { UseFormRegisterReturn } from "react-hook-form";

import { FormFieldError } from "@/components/forms/shared/form-field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inputClass =
  "h-11 border-[color:var(--field-border)] bg-[var(--field-bg)] text-foreground placeholder:text-muted-foreground";

export function FormTextField({
  id,
  label,
  registration,
  error,
  type = "text",
  autoComplete,
  placeholder,
  helper,
}: {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  helper?: string;
}) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasRequiredMarker = label.endsWith(" *");
  const labelText = hasRequiredMarker ? label.slice(0, -2) : label;

  return (
    <div className="space-y-2" data-form-field>
      <div className="flex min-h-5 items-start justify-between gap-3">
        <Label htmlFor={id} className="min-w-0">
          {labelText}
          {hasRequiredMarker ? (
            <span data-required-marker className="text-destructive">
              {" *"}
            </span>
          ) : null}
        </Label>
        <FormFieldError
          id={errorId}
          message={error}
          className="max-w-[62%] shrink-0 text-right leading-5"
        />
      </div>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={inputClass}
        aria-invalid={Boolean(error)}
        aria-required={hasRequiredMarker || undefined}
        aria-describedby={
          [helper ? helperId : "", error ? errorId : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
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
