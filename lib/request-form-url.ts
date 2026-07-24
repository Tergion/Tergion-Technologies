export type RequestModalMode = "quick_request" | "automation_assessment";

export const requestFormParamName = "form";
export const canonicalRequestFormPath = "/contact";

const publicFormValues = {
  quick_request: "quick-request",
  automation_assessment: "automation-assessment",
} as const satisfies Record<RequestModalMode, string>;

export function parseRequestFormMode(
  value: string | null | undefined,
): RequestModalMode | null {
  if (value === publicFormValues.quick_request) {
    return "quick_request";
  }

  if (value === publicFormValues.automation_assessment) {
    return "automation_assessment";
  }

  return null;
}

export function serializeRequestFormMode(mode: RequestModalMode) {
  return publicFormValues[mode];
}

function normalizeSearchParams(search: string | URLSearchParams = "") {
  if (search instanceof URLSearchParams) {
    return new URLSearchParams(search);
  }

  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

function normalizeHash(hash = "") {
  if (!hash) {
    return "";
  }

  return hash.startsWith("#") ? hash : `#${hash}`;
}

function buildPathWithParams(
  pathname: string,
  params: URLSearchParams,
  hash = "",
) {
  const query = params.toString();

  return `${pathname}${query ? `?${query}` : ""}${normalizeHash(hash)}`;
}

export function buildRequestFormUrl(
  mode: RequestModalMode,
  pathname = canonicalRequestFormPath,
  search: string | URLSearchParams = "",
  hash = "",
) {
  const params = normalizeSearchParams(search);

  params.set(requestFormParamName, serializeRequestFormMode(mode));

  return buildPathWithParams(pathname, params, hash);
}

export function removeRequestFormUrl(
  pathname: string,
  search: string | URLSearchParams = "",
  hash = "",
) {
  const params = normalizeSearchParams(search);

  params.delete(requestFormParamName);

  return buildPathWithParams(pathname, params, hash);
}

export const canonicalRequestFormUrls = {
  quickRequest: buildRequestFormUrl("quick_request"),
  automationAssessment: buildRequestFormUrl("automation_assessment"),
} as const;
