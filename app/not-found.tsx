import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-start justify-center px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        The page you requested does not exist or has moved.
      </p>
      <Link
        href="/"
        className={buttonVariants({
          className: "mt-8 h-10 px-4",
        })}
      >
        Return home
      </Link>
    </section>
  );
}
