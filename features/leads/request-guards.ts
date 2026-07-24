import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

export const maxLeadRequestBytes = 32 * 1024;

type RequestGuardResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: number; message: string };

const genericRequestMessage =
  "We could not accept the request right now. Please try again later.";

function getProductionOrigins() {
  const configuredOrigin = new URL(env.siteUrl || siteConfig.domain).origin;
  const configuredUrl = new URL(configuredOrigin);
  const apexHostname = configuredUrl.hostname.replace(/^www\./, "");

  return new Set([
    configuredOrigin,
    `${configuredUrl.protocol}//${apexHostname}`,
    `${configuredUrl.protocol}//www.${apexHostname}`,
    "https://tergion.com",
    "https://www.tergion.com",
  ]);
}

function isControlledLocalOrigin(origin: URL) {
  const hostname = origin.hostname.replace(/^\[|\]$/g, "");

  return (
    env.nodeEnv !== "production" &&
    (origin.protocol === "http:" || origin.protocol === "https:") &&
    ["localhost", "127.0.0.1", "::1"].includes(hostname)
  );
}

export function validateLeadRequestHeaders(request: Request): RequestGuardResult {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return {
      ok: false,
      status: 415,
      message: genericRequestMessage,
    };
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > maxLeadRequestBytes) {
    return {
      ok: false,
      status: 413,
      message: genericRequestMessage,
    };
  }

  const originHeader = request.headers.get("origin");

  if (!originHeader) {
    return { ok: true };
  }

  try {
    const origin = new URL(originHeader);

    if (
      getProductionOrigins().has(origin.origin) ||
      isControlledLocalOrigin(origin)
    ) {
      return { ok: true };
    }
  } catch {
    // The generic response below intentionally hides origin validation details.
  }

  return {
    ok: false,
    status: 403,
    message: genericRequestMessage,
  };
}

export async function readLeadJsonBody(request: Request): Promise<JsonBodyResult> {
  if (!request.body) {
    return {
      ok: false,
      status: 400,
      message: "Please review the required fields and try again.",
    };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const result = await reader.read();

      if (result.done) {
        break;
      }

      totalBytes += result.value.byteLength;

      if (totalBytes > maxLeadRequestBytes) {
        await reader.cancel();
        return {
          ok: false,
          status: 413,
          message: genericRequestMessage,
        };
      }

      chunks.push(result.value);
    }
  } catch {
    return {
      ok: false,
      status: 400,
      message: "Please review the required fields and try again.",
    };
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      value: JSON.parse(new TextDecoder().decode(bodyBytes)) as unknown,
    };
  } catch {
    return {
      ok: false,
      status: 400,
      message: "Please review the required fields and try again.",
    };
  }
}
