import { cn } from "@/lib/utils";

export function FormFieldError({
  message,
  id,
  className,
}: {
  message?: string;
  id: string;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      data-form-field-error
      className={cn("text-xs font-medium text-destructive", className)}
    >
      {message}
    </p>
  );
}
