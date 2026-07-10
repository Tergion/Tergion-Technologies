import { env, hasUpstashRedisConfig } from "@/lib/env";

type UpstashPipelineResult<T = unknown> = {
  result?: T;
  error?: string;
};

type RedisCommand = Array<string | number>;

function getUpstashUrl() {
  return env.upstashRedisRestUrl.replace(/\/$/, "");
}

export async function runUpstashPipeline(
  commands: RedisCommand[],
): Promise<Array<UpstashPipelineResult>> {
  if (!hasUpstashRedisConfig()) {
    throw new Error("upstash-not-configured");
  }

  const response = await fetch(`${getUpstashUrl()}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.upstashRedisRestToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    throw new Error("upstash-request-failed");
  }

  const data = (await response.json()) as unknown;

  if (!Array.isArray(data)) {
    throw new Error("upstash-unexpected-response");
  }

  return data as Array<UpstashPipelineResult>;
}
