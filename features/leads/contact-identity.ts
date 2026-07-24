import "server-only";

const phoneDigitsMin = 7;
const phoneDigitsMax = 15;

export function normalizeContactEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeContactPhone(value: string | undefined) {
  if (!value) {
    return "";
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length < phoneDigitsMin || digits.length > phoneDigitsMax) {
    return "";
  }

  return digits;
}

export function getProviderPhone(value: string | undefined) {
  const digits = normalizeContactPhone(value);

  if (!digits) {
    return undefined;
  }

  return value?.trim().startsWith("+") ? `+${digits}` : digits;
}

export function normalizeContactName(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ") || undefined;
}

export function maskEmail(value: string) {
  const normalized = normalizeContactEmail(value);
  const separator = normalized.lastIndexOf("@");

  if (separator <= 0) {
    return "***";
  }

  const local = normalized.slice(0, separator);
  const domain = normalized.slice(separator + 1);
  const visibleLocal = local.slice(0, 1);
  const domainParts = domain.split(".");
  const domainName = domainParts[0] ?? "";
  const suffix = domainParts.length > 1 ? `.${domainParts.at(-1)}` : "";

  return `${visibleLocal}***@${domainName.slice(0, 1)}***${suffix}`;
}

export function maskPhone(value: string | undefined) {
  const digits = normalizeContactPhone(value);

  return digits ? `***${digits.slice(-4)}` : "***";
}
