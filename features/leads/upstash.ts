import "server-only";

import { env, hasUpstashRedisConfig } from "@/lib/env";

const upstashRequestTimeoutMs = 3_000;
const upstashMaxResponseBytes = 64 * 1024;

type UpstashPipelineResult<T = unknown> = {
  result?: T;
  error?: string;
};

type RedisCommand = Array<string | number>;

function getUpstashUrl() {
  return env.upstashRedisRestUrl.replace(/\/$/, "");
}

async function readBoundedResponse(response: Response) {
  if (!response.body) {
    return "";
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);

  if (
    Number.isFinite(contentLength) &&
    contentLength > upstashMaxResponseBytes
  ) {
    await response.body.cancel();
    throw new Error("upstash-response-too-large");
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

    if (totalBytes > upstashMaxResponseBytes) {
      await reader.cancel();
      throw new Error("upstash-response-too-large");
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

export async function runUpstashPipeline(
  commands: RedisCommand[],
): Promise<Array<UpstashPipelineResult>> {
  if (!hasUpstashRedisConfig()) {
    throw new Error("upstash-not-configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    upstashRequestTimeoutMs,
  );

  try {
    const response = await fetch(`${getUpstashUrl()}/pipeline`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${env.upstashRedisRestToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      signal: controller.signal,
    });
    const responseText = await readBoundedResponse(response);
    const contentType = response.headers.get("content-type") ?? "";

    if (
      !response.ok ||
      !contentType.toLowerCase().includes("application/json")
    ) {
      throw new Error("upstash-request-failed");
    }

    const data = JSON.parse(responseText) as unknown;

    if (!Array.isArray(data)) {
      throw new Error("upstash-unexpected-response");
    }

    return data as Array<UpstashPipelineResult>;
  } catch {
    throw new Error("upstash-unexpected-response");
  } finally {
    clearTimeout(timeout);
  }
}
