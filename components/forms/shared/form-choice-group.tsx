"use client";

import type { ChangeEvent } from "react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

import { FormFieldError } from "@/components/forms/shared/form-field-error";
import { cn } from "@/lib/utils";

type ChoiceOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type FormChoiceGroupProps<TValues extends FieldValues> = {
  name: Path<TValues>;
  legend: string;
  options: readonly ChoiceOption[];
  register: UseFormRegister<TValues>;
  error?: string;
  required?: boolean;
  columns?: 1 | 2 | 3 | 4;
  idPrefix?: string;
  helper?: string;
  onValueChange?: (value: string) => void | Promise<void>;
};

export function FormChoiceGroup<TValues extends FieldValues>({
  name,
  legend,
  options,
  register,
  error,
  required = false,
  columns = 2,
  idPrefix = "",
  helper,
  onValueChange,
}: FormChoiceGroupProps<TValues>) {
  const errorId = `${idPrefix}${name}-error`;
  const helperId = `${idPrefix}${name}-helper`;

  return (
    <fieldset className="space-y-3" data-form-choice-group>
      <legend className="sr-only">
        {legend}
        {required ? " *" : ""}
      </legend>
      <div className="flex min-h-5 items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className="min-w-0 text-sm font-medium text-foreground"
        >
          {legend}
          {required ? " *" : ""}
        </span>
        <FormFieldError
          id={errorId}
          message={error}
          className="max-w-[62%] shrink-0 text-right leading-5"
        />
      </div>
      <div
        className={cn(
          "grid gap-2",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
          columns === 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {options.map((option) => {
          const id = `${idPrefix}${name}-${option.value}`;
          const registration = register(name);

          return (
            <label
              key={option.value}
              htmlFor={id}
              aria-disabled={option.disabled || undefined}
              className={cn(
                "action-button flex min-h-11 items-center gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] px-3 py-2 text-sm text-foreground transition-[background-color,border-color,box-shadow,transform] duration-200 has-[:checked]:border-[color:var(--island-active-border)] has-[:checked]:bg-[var(--island-active-bg)] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-[var(--island-focus-ring)]",
                option.disabled
                  ? "cursor-not-allowed opacity-55"
                  : "cursor-pointer hover:border-[color:var(--button-border-hover)] hover:bg-[var(--button-muted-hover)] active:translate-y-px has-[:checked]:hover:bg-[var(--button-active-hover)]",
              )}
            >
              <input
                id={id}
                type="radio"
                value={option.value}
                disabled={option.disabled}
                className="size-4 shrink-0 accent-[var(--island-active-border)]"
                aria-describedby={
                  [helper ? helperId : "", error ? errorId : ""]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                {...registration}
                onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                  await registration.onChange(event);
                  await onValueChange?.(event.target.value);
                }}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      {helper ? (
        <p id={helperId} className="text-xs leading-5 text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </fieldset>
  );
}
