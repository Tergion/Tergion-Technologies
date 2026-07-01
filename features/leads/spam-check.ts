import type { LeadSubmission } from "@/features/leads/lead.types";

export type SpamCheckResult = {
  passed: boolean;
  score: number;
  reasons: string[];
};

const minimumCompletionMs = 3500;

function countUrls(value: string | undefined) {
  if (!value) {
    return 0;
  }

  return (value.match(/https?:\/\//gi) ?? []).length;
}

function hasRepeatedText(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();
  if (normalized.length < 60) {
    return false;
  }

  const firstChunk = normalized.slice(0, 30);
  return normalized.indexOf(firstChunk, 31) !== -1;
}

export function checkLeadSpamSignals(
  payload: LeadSubmission,
  now = Date.now(),
): SpamCheckResult {
  const reasons: string[] = [];
  let score = 0;

  if (payload.honeypot) {
    score += 100;
    reasons.push("honeypot-filled");
  }

  if (
    payload.completionStartedAt &&
    now - payload.completionStartedAt < minimumCompletionMs
  ) {
    score += 60;
    reasons.push("completion-too-fast");
  }

  if (countUrls(payload.notes) > 2) {
    score += 25;
    reasons.push("too-many-note-urls");
  }

  if (hasRepeatedText(payload.notes)) {
    score += 20;
    reasons.push("repeated-note-text");
  }

  return {
    passed: score < 60,
    score,
    reasons,
  };
}
