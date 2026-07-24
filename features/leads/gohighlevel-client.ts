import "server-only";

import { env } from "@/lib/env";

const goHighLevelBaseUrl = "https://services.leadconnectorhq.com";
const requestTimeoutMs = 6_000;
const maxResponseBytes = 128 * 1024;
const maxSafeReadAttempts = 3;
const maxRetryDelayMs = 2_000;

type GoHighLevelMethod = "GET" | "POST" | "PUT";

export type GoHighLevelRequestStage =
  | "discover-assessment-schema"
  | "discover-assessment-association"
  | "search-assessment-record"
  | "create-assessment-record"
  | "get-assessment-relations"
  | "create-assessment-relation"
  | "search-contacts"
  | "get-contact"
  | "update-contact"
  | "upsert-contact"
  | "add-tags"
  | "get-contact-notes"
  | "create-note";

type GoHighLevelRequestOptions = {
  method: GoHighLevelMethod;
  path: string;
  version: "v3";
  stage: GoHighLevelRequestStage;
  leadId: string;
  body?: Record<string, unknown>;
  expectedStatuses: readonly number[];
  parseJson?: boolean;
  retrySafeRead?: boolean;
};

type GoHighLevelErrorKind =
  | "authorization"
  | "http"
  | "network"
  | "response"
  | "timeout";

export class GoHighLevelRequestError extends Error {
  readonly kind: GoHighLevelErrorKind;
  readonly stage: GoHighLevelRequestStage;
  readonly status?: number;

  constructor(args: {
    kind: GoHighLevelErrorKind;
    stage: GoHighLevelRequestStage;
    status?: number;
  }) {
    super(`gohighlevel-${args.stage}-${args.kind}`);
    this.name = "GoHighLevelRequestError";
    this.kind = args.kind;
    this.stage = args.stage;
    this.status = args.status;
  }
}

function isTransientStatus(status: number) {
  return status === 429 || status >= 500;
}

export function isAmbiguousGoHighLevelFailure(error: unknown) {
  return (
    error instanceof GoHighLevelRequestError &&
    (error.kind === "network" ||
      error.kind === "timeout" ||
      (error.kind === "response" &&
        error.status !== undefined &&
        error.status >= 200 &&
        error.status < 300) ||
      (error.status !== undefined && isTransientStatus(error.status)))
  );
}

class GoHighLevelResponseTooLargeError extends Error {}

function logRequestFailure(
  error: GoHighLevelRequestError,
  leadId: string,
) {
  console.error("GoHighLevel lead sync failed", {
    provider: "gohighlevel",
    stage: error.stage,
    status: error.status,
    kind: error.kind,
    leadId,
  });
}

async function readBoundedResponse(response: Response) {
  if (!response.body) {
    return "";
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);

  if (
    Number.isFinite(contentLength) &&
    contentLength > maxResponseBytes
  ) {
    await response.body.cancel();
    throw new GoHighLevelResponseTooLargeError();
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const result = await reader.read();

    if (result.done) {
      break;
    }

    totalBytes += result.value.byteLength;

    if (totalBytes > maxResponseBytes) {
      await reader.cancel();
      throw new GoHighLevelResponseTooLargeError();
    }

    chunks.push(result.value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bytes);
}

function parseRetryAfter(response: Response) {
  const value = response.headers.get("retry-after")?.trim();

  if (!value) {
    return undefined;
  }

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1_000;
  }

  const date = Date.parse(value);

  if (Number.isNaN(date)) {
    return undefined;
  }

  return Math.max(date - Date.now(), 0);
}

function retryDelay(attempt: number, response?: Response) {
  const retryAfter = response ? parseRetryAfter(response) : undefined;

  if (retryAfter !== undefined) {
    return retryAfter;
  }

  const exponential = 125 * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 75);

  return Math.min(exponential + jitter, maxRetryDelayMs);
}

function wait(delayMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function makeRequest(options: GoHighLevelRequestOptions) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(`${goHighLevelBaseUrl}${options.path}`, {
      method: options.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${env.goHighLevelToken}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Version: options.version,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    return {
      response,
      timedOut: () => controller.signal.aborted,
      finish: () => clearTimeout(timeout),
    };
  } catch (error) {
    clearTimeout(timeout);

    if (
      controller.signal.aborted ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new GoHighLevelRequestError({
        kind: "timeout",
        stage: options.stage,
      });
    }

    throw new GoHighLevelRequestError({
      kind: "network",
      stage: options.stage,
    });
  }
}

export async function requestGoHighLevel(
  options: GoHighLevelRequestOptions,
): Promise<unknown> {
  const attempts = options.retrySafeRead ? maxSafeReadAttempts : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    let activeRequest: Awaited<ReturnType<typeof makeRequest>>;
    let response: Response;

    try {
      activeRequest = await makeRequest(options);
      response = activeRequest.response;
    } catch (error) {
      const requestError =
        error instanceof GoHighLevelRequestError
          ? error
          : new GoHighLevelRequestError({
              kind: "network",
              stage: options.stage,
            });

      if (options.retrySafeRead && attempt + 1 < attempts) {
        await wait(retryDelay(attempt));
        continue;
      }

      logRequestFailure(requestError, options.leadId);
      throw requestError;
    }

    let responseText = "";

    try {
      responseText = await readBoundedResponse(response);
    } catch (bodyError) {
      const bodyReadWasTransient =
        !(bodyError instanceof GoHighLevelResponseTooLargeError);
      const requestError = new GoHighLevelRequestError({
        kind: activeRequest.timedOut()
          ? "timeout"
          : bodyReadWasTransient
            ? "network"
            : "response",
        stage: options.stage,
        status: response.status,
      });
      activeRequest.finish();

      if (
        options.retrySafeRead &&
        bodyReadWasTransient &&
        attempt + 1 < attempts
      ) {
        await wait(retryDelay(attempt));
        continue;
      }

      logRequestFailure(requestError, options.leadId);
      throw requestError;
    }

    activeRequest.finish();

    if (!options.expectedStatuses.includes(response.status)) {
      if (
        options.retrySafeRead &&
        isTransientStatus(response.status) &&
        attempt + 1 < attempts
      ) {
        const delayMs = retryDelay(attempt, response);

        if (delayMs <= maxRetryDelayMs) {
          await wait(delayMs);
          continue;
        }
      }

      const error = new GoHighLevelRequestError({
        kind:
          response.status === 401 || response.status === 403
            ? "authorization"
            : "http",
        stage: options.stage,
        status: response.status,
      });
      logRequestFailure(error, options.leadId);
      throw error;
    }

    if (!options.parseJson) {
      return undefined;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (
      responseText &&
      !contentType.toLowerCase().includes("application/json")
    ) {
      const error = new GoHighLevelRequestError({
        kind: "response",
        stage: options.stage,
        status: response.status,
      });
      logRequestFailure(error, options.leadId);
      throw error;
    }

    try {
      return responseText ? (JSON.parse(responseText) as unknown) : undefined;
    } catch {
      const error = new GoHighLevelRequestError({
        kind: "response",
        stage: options.stage,
        status: response.status,
      });
      logRequestFailure(error, options.leadId);
      throw error;
    }
  }

  const error = new GoHighLevelRequestError({
    kind: "network",
    stage: options.stage,
  });
  logRequestFailure(error, options.leadId);
  throw error;
}
