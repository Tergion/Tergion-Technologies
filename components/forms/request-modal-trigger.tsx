"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useRequestModal } from "@/components/forms/request-modal-provider";
import type { RequestModalMode } from "@/components/forms/request-modal-provider";
import { cn } from "@/lib/utils";

type RequestModalTriggerProps = Omit<
  ComponentProps<typeof Button>,
  "onClick" | "render" | "type"
> & {
  href?: string;
  icon?: ReactNode;
  label?: string;
  mode?: RequestModalMode;
  rel?: ComponentProps<"a">["rel"];
  target?: ComponentProps<"a">["target"];
  triggerSource?: string;
};

function shouldOpenClientSide(
  event: MouseEvent<HTMLElement>,
  href?: string,
  target?: string,
) {
  if (!href) {
    return true;
  }

  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    (target && target !== "_self")
  ) {
    return false;
  }

  const url = new URL(href, window.location.href);

  return url.origin === window.location.origin;
}

export function RequestModalTrigger({
  children,
  className,
  href,
  icon,
  label = "Start when ready",
  mode = "quick_request",
  rel,
  size,
  target,
  triggerSource,
  variant,
  ...props
}: RequestModalTriggerProps) {
  const { openRequestModal } = useRequestModal();
  const content = children ?? (
    <>
      {icon}
      <span>{label}</span>
    </>
  );

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (!shouldOpenClientSide(event, href, target)) {
      return;
    }

    event.preventDefault();
    openRequestModal({
      mode,
      trigger: event.currentTarget,
      triggerSource,
    });
  }

  if (href) {
    const { disabled, ...anchorProps } = props;

    return (
      <a
        {...(anchorProps as ComponentProps<"a">)}
        href={href}
        rel={rel}
        target={target}
        aria-disabled={disabled || props["aria-disabled"]}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Button
      type="button"
      className={cn(className)}
      onClick={handleClick}
      size={size}
      variant={variant}
      {...props}
    >
      {content}
    </Button>
  );
}
