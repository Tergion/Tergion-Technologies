import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function makeRequest(origin?: string) {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);

  return new Request("https://tergion.com/api/leads", {
    method: "POST",
    headers,
    body: "{}",
  });
}

describe("lead request origin validation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://tergion.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(["https://tergion.com", "https://www.tergion.com"])(
    "permits the production origin %s",
    async (origin) => {
      vi.stubEnv("NODE_ENV", "production");
      const { validateLeadRequestHeaders } = await import(
        "@/features/leads/request-guards"
      );

      expect(validateLeadRequestHeaders(makeRequest(origin))).toEqual({
        ok: true,
      });
    },
  );

  it.each([
    "http://localhost:3000",
    "http://127.0.0.1:3100",
    "https://[::1]:3200",
  ])("permits a controlled local/test origin %s", async (origin) => {
    vi.stubEnv("NODE_ENV", "test");
    const { validateLeadRequestHeaders } = await import(
      "@/features/leads/request-guards"
    );

    expect(validateLeadRequestHeaders(makeRequest(origin))).toEqual({
      ok: true,
    });
  });

  it("rejects a present unrecognized origin", async () => {
    const { validateLeadRequestHeaders } = await import(
      "@/features/leads/request-guards"
    );
    const result = validateLeadRequestHeaders(
      makeRequest("https://unrecognized.example"),
    );

    expect(result).toMatchObject({ ok: false, status: 403 });
  });

  it("does not reject a request solely because Origin is absent", async () => {
    const { validateLeadRequestHeaders } = await import(
      "@/features/leads/request-guards"
    );

    expect(validateLeadRequestHeaders(makeRequest())).toEqual({ ok: true });
  });
});
