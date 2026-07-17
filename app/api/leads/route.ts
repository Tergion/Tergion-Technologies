import { appendLeadToGoogleSheet } from "@/features/leads/google-sheets";
import { checkDuplicateLead } from "@/features/leads/duplicate-check";
import { checkLeadRateLimit } from "@/features/leads/rate-limit";
import {
  leadDuplicateMessage,
  leadSuccessMessage,
} from "@/features/leads/lead.constants";
import { leadSubmissionSchema } from "@/features/leads/lead.schema";
import {
  sendInternalLeadNotification,
  sendLeadConfirmationEmail,
} from "@/features/leads/email";
import { sendLeadToGoHighLevel } from "@/features/leads/gohighlevel";
import { checkLeadSpamSignals } from "@/features/leads/spam-check";
import { verifyTurnstileToken } from "@/features/leads/turnstile";
import type { LeadRecord } from "@/features/leads/lead.types";

function getRemoteIp(request: Request) {
  const connectingIp = request.headers.get("cf-connecting-ip") ?? "";
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";

  return (
    connectingIp.trim() ||
    forwardedFor.split(",")[0]?.trim() ||
    realIp ||
    undefined
  );
}

function validationErrorResponse() {
  return Response.json(
    {
      ok: false,
      message: "Please review the required fields and try again.",
    },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  let rawPayload: unknown;

  try {
    rawPayload = await request.json();
  } catch {
    return validationErrorResponse();
  }

  const parsed = leadSubmissionSchema.safeParse(rawPayload);

  if (!parsed.success) {
    return validationErrorResponse();
  }

  const rateLimit = await checkLeadRateLimit(request);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        ok: false,
        message: "We could not accept the request right now. Please try again later.",
      },
      { status: 429 },
    );
  }

  const payload = parsed.data;
  const spam = checkLeadSpamSignals(payload);

  if (!spam.passed) {
    return Response.json({
      ok: true,
      message: leadSuccessMessage,
    });
  }

  const turnstile = await verifyTurnstileToken(
    payload.turnstileToken,
    getRemoteIp(request),
  );

  if (turnstile.configured && !turnstile.success) {
    return Response.json(
      {
        ok: false,
        message: "We could not verify the request. Please try again.",
      },
      { status: 400 },
    );
  }

  const duplicate = await checkDuplicateLead(payload.email, payload.phone);

  if (duplicate.duplicateLikely) {
    return Response.json({
      ok: true,
      message: leadDuplicateMessage,
    });
  }

  const createdAt = new Date().toISOString();
  const lead: LeadRecord = {
    ...payload,
    leadId: crypto.randomUUID(),
    createdAt,
    status: "new",
    security: {
      turnstileVerified: turnstile.success,
      turnstileConfigured: turnstile.configured,
      spamScore: spam.score,
      spamReasons: spam.reasons,
      rateLimitReason: rateLimit.reason,
      duplicateLikely: duplicate.duplicateLikely,
      duplicateReason: duplicate.reason,
    },
  };

  try {
    await sendLeadToGoHighLevel(lead);
    await appendLeadToGoogleSheet(lead);
    await sendInternalLeadNotification(lead);
  } catch {
    return Response.json(
      {
        ok: false,
        message:
          "We could not process the request right now. Please try again later.",
      },
      { status: 500 },
    );
  }

  try {
    await sendLeadConfirmationEmail(lead);
  } catch {
    console.warn("Lead confirmation email delivery failed", {
      provider: "email",
      stage: "route",
      leadId: lead.leadId,
    });
  }

  return Response.json({
    ok: true,
    message: leadSuccessMessage,
    leadId: lead.leadId,
  });
}
