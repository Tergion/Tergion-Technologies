export type WorkflowStep = {
  title: string;
  summary: string;
  controlPoint?: string;
};

export type WorkflowShowcase = {
  slug: string;
  tabLabel: string;
  eyebrow: string;
  headline: string;
  summary: string;
  imageSrc: string | null;
  imageAlt: string;
  steps: WorkflowStep[];
  primaryCta: string;
  exampleHref: string;
};
