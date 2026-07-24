import {
  automationAssessmentDuplicateMessage,
  getAutomationAssessmentSuccessMessage,
} from "@/features/assessments/assessment.constants";
import {
  commitGoHighLevelSubmission,
  isGoHighLevelSubmissionCompleted,
  markLeadSubmissionCompleted,
  releaseLeadSubmission,
  reserveLeadSubmission,
} from "@/features/leads/duplicate-check";
import {
  sendInternalLeadNotification,
  sendLeadConfirmationEmail,
} from "@/features/leads/email";
import { appendLeadToGoogleSheet } from "@/features/leads/google-sheets";
import { sendLeadToGoHighLevel } from "@/features/leads/gohighlevel";
import { isContactResolutionError } from "@/features/leads/gohighlevel-contact";
import { isAmbiguousGoHighLevelFailure } from "@/features/leads/gohighlevel-client";
import {
  leadDuplicateMessage,
  leadSuccessMessage,
} from "@/features/leads/lead.constants";
import { leadSubmissionSchema } from "@/features/leads/lead.schema";
import type { LeadRecord, LeadSubmission } from "@/features/leads/lead.types";
import { checkLeadRateLimit } from "@/features/leads/rate-limit";
import {
  readLeadJsonBody,
  validateLeadRequestHeaders,
} from "@/features/leads/request-guards";
import { checkLeadSpamSignals } from "@/features/leads/spam-check";
import { deriveSubmissionLeadId } from "@/features/leads/submission-id";
import { verifyTurnstileToken } from "@/features/leads/turnstile";
import { env } from "@/lib/env";

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

function processingErrorResponse(status = 500) {
  return Response.json(
    {
      ok: false,
      message:
        "We couldn't process this request automatically. Please verify your contact information or email contact@tergion.com.",
    },
    { status },
  );
}

function getSubmissionSuccessMessage(payload: LeadSubmission) {
  return payload.submissionType === "automation_assessment"
    ? getAutomationAssessmentSuccessMessage(
        payload.assessmentFollowUpPreference,
      )
    : leadSuccessMessage;
}

function getSubmissionDuplicateMessage(payload: LeadSubmission) {
  return payload.submissionType === "automation_assessment"
    ? automationAssessmentDuplicateMessage
    : leadDuplicateMessage;
}

export async function POST(request: Request) {
  const headerValidation = validateLeadRequestHeaders(request);

  if (!headerValidation.ok) {
    return Response.json(
      { ok: false, message: headerValidation.message },
      { status: headerValidation.status },
    );
  }

  const body = await readLeadJsonBody(request);

  if (!body.ok) {
    return Response.json(
      { ok: false, message: body.message },
      { status: body.status },
    );
  }

  const parsed = leadSubmissionSchema.safeParse(body.value);

  if (!parsed.success) {
    return validationErrorResponse();
  }

  const payload = parsed.data;
  const spam = checkLeadSpamSignals(payload);

  if (spam.reasons.includes("honeypot-filled")) {
    return Response.json({
      ok: true,
      message: getSubmissionSuccessMessage(payload),
    });
  }

  if (!spam.passed) {
    return Response.json(
      {
        ok: false,
        message:
          "We could not accept the request right now. Please try again later.",
      },
      { status: 400 },
    );
  }

  const rateLimit = await checkLeadRateLimit(request);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        ok: false,
        message:
          "We could not accept the request right now. Please try again later.",
      },
      { status: 429 },
    );
  }

  const turnstile = await verifyTurnstileToken(
    payload.turnstileToken,
    getRemoteIp(request),
  );

  if (!turnstile.success) {
    return Response.json(
      {
        ok: false,
        message: "We could not verify the request. Please try again.",
      },
      { status: 400 },
    );
  }

  const leadId = await deriveSubmissionLeadId(
    payload.submissionType,
    payload.submissionId,
  );
  const reservationResult = await reserveLeadSubmission(
    payload.submissionType,
    leadId,
    payload.email,
    payload.phone,
  );

  if (
    reservationResult.status === "completed" ||
    reservationResult.status === "duplicate"
  ) {
    return Response.json({
      ok: true,
      message: getSubmissionDuplicateMessage(payload),
    });
  }

  if (reservationResult.status === "unavailable") {
    return processingErrorResponse(503);
  }

  if (reservationResult.status === "busy") {
    return processingErrorResponse(409);
  }

  if (reservationResult.status !== "reserved") {
    return processingErrorResponse(503);
  }

  const reservation = reservationResult.reservation;
  let goHighLevelDurable = false;

  try {
    const lead: LeadRecord = {
      ...payload,
      leadId,
      createdAt: new Date().toISOString(),
      status: "new",
      security: {
        turnstileVerified: turnstile.success,
        turnstileConfigured: turnstile.configured,
        spamScore: spam.score,
        spamReasons: spam.reasons,
        rateLimitReason: rateLimit.reason,
        duplicateLikely: false,
      },
    };
    try {
      const goHighLevelAlreadyCompleted =
        await isGoHighLevelSubmissionCompleted(
          payload.submissionType,
          leadId,
        );

      if (!goHighLevelAlreadyCompleted) {
        const goHighLevel = await sendLeadToGoHighLevel(lead);

        if (
          env.nodeEnv === "production" &&
          (!goHighLevel.configured || !goHighLevel.ok)
        ) {
          throw new Error("gohighlevel-production-delivery-unavailable");
        }

      }

      await commitGoHighLevelSubmission(reservation);
      goHighLevelDurable = true;
      await appendLeadToGoogleSheet(lead);
      await sendInternalLeadNotification(lead);
    } catch (error) {
      if (isContactResolutionError(error)) {
        return processingErrorResponse(
          error.category === "provider_unavailable" ? 503 : 409,
        );
      }

      if (isAmbiguousGoHighLevelFailure(error)) {
        goHighLevelDurable = true;
      }

      return processingErrorResponse();
    }

    try {
      await markLeadSubmissionCompleted(payload.submissionType, leadId);
    } catch {
      return processingErrorResponse(503);
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
      message: getSubmissionSuccessMessage(payload),
      leadId: lead.leadId,
    });
  } finally {
    await releaseLeadSubmission(reservation, {
      releaseIdentityReservation: !goHighLevelDurable,
    });
  }
}
