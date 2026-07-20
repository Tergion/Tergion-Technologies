import type { ReactNode } from "react";

type MarketingPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function MarketingPageHeader({
  eyebrow,
  title,
  description,
  children,
}: MarketingPageHeaderProps) {
  return (
    <section
      className="marketing-page-header pb-12 pt-28 md:pb-16 md:pt-36"
      data-marketing-page-header=""
    >
      <div className="site-container">
        <div className="max-w-4xl border-l-[3px] border-[color:var(--surface-navy)] pl-5 md:pl-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
