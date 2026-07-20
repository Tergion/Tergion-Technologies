import { env } from "@/lib/env";

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string,
): Promise<{ success: boolean; configured: boolean; reason?: string }> {
  if (!env.turnstileSecretKey) {
    const allowDevelopmentBypass = env.nodeEnv !== "production";

    return {
      success: allowDevelopmentBypass,
      configured: false,
      reason: allowDevelopmentBypass
        ? "turnstile-secret-missing-development-stub"
        : "turnstile-secret-missing-production",
    };
  }

  if (!token) {
    return {
      success: false,
      configured: true,
      reason: "turnstile-token-missing",
    };
  }

  const formData = new FormData();
  formData.append("secret", env.turnstileSecretKey);
  formData.append("response", token);

  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      },
    );
    const result = (await response.json()) as { success?: boolean };

    return {
      success: Boolean(result.success),
      configured: true,
      reason: result.success ? undefined : "turnstile-verification-failed",
    };
  } catch {
    return {
      success: false,
      configured: true,
      reason: "turnstile-verification-error",
    };
  }
}
