import {
  env,
  getEmailProvider,
  hasConfirmationEmailConfig,
  hasInternalEmailConfig,
  type EmailProvider,
} from "@/lib/env";
import {
  confirmationEmailSubject,
  renderConfirmationEmailHtml,
  renderConfirmationEmailText,
} from "@/features/leads/confirmation-email-template";
import {
  assessmentConfirmationEmailSubject,
  renderAssessmentConfirmationEmailHtml,
  renderAssessmentConfirmationEmailText,
} from "@/features/assessments/assessment-confirmation-email-template";
import { renderInternalLeadText } from "@/features/leads/lead-email-template";
import type { LeadRecord, ProviderResult } from "@/features/leads/lead.types";
import { siteConfig } from "@/lib/site-config";

const emailRequestTimeoutMs = 5_000;
const resendEmailEndpoint = "https://api.resend.com/emails";
const postmarkEmailEndpoint = "https://api.postmarkapp.com/email";

type EmailFailureStage = "configuration" | "request" | "response";

function logConfirmationEmailFailure(
  lead: LeadRecord,
  provider: string,
  stage: EmailFailureStage,
  status?: number,
) {
  console.warn("Lead confirmation email delivery failed", {
    provider,
    stage,
    status,
    leadId: lead.leadId,
  });
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), emailRequestTimeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function sendWithResend(
  lead: LeadRecord,
  subject: string,
  html: string,
  text: string,
) {
  return fetchWithTimeout(resendEmailEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `lead-confirmation-${lead.leadId}`,
    },
    body: JSON.stringify({
      from: siteConfig.transactionalEmail.from,
      to: [lead.email],
      subject,
      html,
      text,
      reply_to: siteConfig.transactionalEmail.replyTo,
    }),
  });
}

async function sendWithPostmark(
  lead: LeadRecord,
  subject: string,
  html: string,
  text: string,
) {
  return fetchWithTimeout(postmarkEmailEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": env.postmarkServerToken,
    },
    body: JSON.stringify({
      From: siteConfig.transactionalEmail.from,
      To: lead.email,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
      ReplyTo: siteConfig.transactionalEmail.replyTo,
      MessageStream: "outbound",
      TrackOpens: false,
      TrackLinks: "None",
    }),
  });
}

async function sendWithProvider(
  provider: EmailProvider,
  lead: LeadRecord,
  subject: string,
  html: string,
  text: string,
) {
  if (provider === "resend") {
    return sendWithResend(lead, subject, html, text);
  }

  return sendWithPostmark(lead, subject, html, text);
}

export async function sendInternalLeadNotification(
  lead: LeadRecord,
): Promise<ProviderResult> {
  const text = renderInternalLeadText(lead);
  void text;

  if (!hasInternalEmailConfig()) {
    return {
      ok: true,
      configured: false,
      provider: "email",
      message:
        "Development stub: email provider credentials are not configured.",
    };
  }

  return {
    ok: true,
    configured: true,
    provider: "email",
    message:
      "Phase 1A stub: email provider config is present, but sending is deferred.",
  };
}

export async function sendLeadConfirmationEmail(
  lead: LeadRecord,
): Promise<ProviderResult> {
  if (!env.emailProvider.trim()) {
    return {
      ok: true,
      configured: false,
      provider: "email",
      message: "Confirmation email provider is not configured.",
    };
  }

  const provider = getEmailProvider();

  if (!provider || !hasConfirmationEmailConfig()) {
    logConfirmationEmailFailure(
      lead,
      provider ?? "unsupported",
      "configuration",
    );

    return {
      ok: false,
      configured: false,
      provider: provider ?? "email",
      message: "Confirmation email provider configuration is incomplete.",
    };
  }

  const isAssessment = lead.submissionType === "automation_assessment";
  const subject = isAssessment
    ? assessmentConfirmationEmailSubject
    : confirmationEmailSubject;
  const html = isAssessment
    ? renderAssessmentConfirmationEmailHtml(lead)
    : renderConfirmationEmailHtml(lead);
  const text = isAssessment
    ? renderAssessmentConfirmationEmailText(lead)
    : renderConfirmationEmailText(lead);

  try {
    const response = await sendWithProvider(
      provider,
      lead,
      subject,
      html,
      text,
    );

    if (!response.ok) {
      logConfirmationEmailFailure(lead, provider, "response", response.status);

      return {
        ok: false,
        configured: true,
        provider,
        message: "Confirmation email delivery failed.",
      };
    }

    if (provider === "postmark") {
      const result = (await response.json().catch(() => null)) as
        | { ErrorCode?: number }
        | null;

      if (!result || result.ErrorCode !== 0) {
        logConfirmationEmailFailure(lead, provider, "response", response.status);

        return {
          ok: false,
          configured: true,
          provider,
          message: "Confirmation email delivery failed.",
        };
      }
    }

    return {
      ok: true,
      configured: true,
      provider,
      message: "Lead confirmation email sent.",
    };
  } catch {
    logConfirmationEmailFailure(lead, provider, "request");

    return {
      ok: false,
      configured: true,
      provider,
      message: "Confirmation email delivery failed.",
    };
  }
}
