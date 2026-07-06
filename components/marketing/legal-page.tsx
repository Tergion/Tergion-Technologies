import Link from "next/link";

import type {
  LegalPageContent,
  LegalStatus,
} from "@/features/legal/legal-content";

const statusClass: Record<LegalStatus, string> = {
  Active:
    "border-success/30 bg-[var(--surface-soft-green)] text-success",
  Configured:
    "border-primary/30 bg-[var(--island-active-bg)] text-primary",
  Planned: "border-warning/30 bg-[var(--warning-panel-bg)] text-warning",
  "Not currently active":
    "border-[color:var(--field-border)] bg-[var(--field-bg)] text-muted-foreground",
};

function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link className="font-medium text-primary hover:text-foreground" href={href}>
        {children}
      </Link>
    );
  }

  return (
    <a className="font-medium text-primary hover:text-foreground" href={href}>
      {children}
    </a>
  );
}

export function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <article className="mx-auto max-w-4xl px-6 pb-20 pt-32 md:pt-40">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        Legal
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
        {content.title}
      </h1>
      <dl className="mt-6 grid gap-3 rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-foreground">Effective Date</dt>
          <dd className="mt-1 text-muted-foreground">
            {content.effectiveDate}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Last Updated</dt>
          <dd className="mt-1 text-muted-foreground">
            {content.lastUpdatedDate}
          </dd>
        </div>
      </dl>
      <p className="mt-8 text-lg leading-8 text-muted-foreground">
        {content.intro}
      </p>

      <div className="mt-12 space-y-10">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold text-foreground">
              {section.heading}
            </h2>
            {section.body?.length ? (
              <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            {section.items?.length ? (
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li
                    key={`${item.label ?? item.text}-${item.status ?? ""}`}
                    className="rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      {item.label ? (
                        <p className="text-sm font-semibold text-foreground">
                          {item.label}
                        </p>
                      ) : null}
                      {item.status ? (
                        <span
                          className={`inline-flex w-fit rounded-md border px-2 py-1 text-xs font-semibold ${statusClass[item.status]}`}
                        >
                          {item.status}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.text}
                      {item.href ? (
                        <>
                          {" "}
                          <InlineLink href={item.href}>
                            {item.hrefLabel ?? item.href}
                          </InlineLink>
                        </>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="rounded-lg border border-[color:var(--field-border)] bg-[var(--field-bg-muted)] p-5">
          <h2 className="text-xl font-semibold text-foreground">
            {content.contact.label}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Questions about this page can be sent to{" "}
            <a
              className="font-medium text-primary hover:text-foreground"
              href={`mailto:${content.contact.email}`}
            >
              {content.contact.email}
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
