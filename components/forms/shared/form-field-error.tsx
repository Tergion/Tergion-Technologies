import { cn } from "@/lib/utils";

export function FormFieldError({
  message,
  id,
  className,
  as: Component = "p",
}: {
  message?: string;
  id: string;
  className?: string;
  as?: "p" | "span";
}) {
  if (!message) {
    return null;
  }

  return (
    <Component
      id={id}
      data-form-field-error
      className={cn("text-xs font-medium text-destructive", className)}
    >
      {message}
    </Component>
  );
}
