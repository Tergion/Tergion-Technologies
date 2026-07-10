export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://tergion.com",
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Tergion Technologies",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || "",
  googleSheetsClientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || "",
  googleSheetsPrivateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY || "",
  googleSheetsSpreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "",
  googleSheetsWorksheetName:
    process.env.GOOGLE_SHEETS_WORKSHEET_NAME || "Leads",
  emailProvider: process.env.EMAIL_PROVIDER || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  postmarkServerToken: process.env.POSTMARK_SERVER_TOKEN || "",
  leadNotificationEmail: process.env.LEAD_NOTIFICATION_EMAIL || "",
  leadFromEmail:
    process.env.LEAD_FROM_EMAIL ||
    "Tergion Technologies <contact@tergion.com>",
  goHighLevelToken:
    process.env.GHL_PRIVATE_INTEGRATION_TOKEN ||
    process.env.GHL_API_KEY ||
    "",
  goHighLevelLocationId: process.env.GHL_LOCATION_ID || "",
  goHighLevelSource:
    process.env.GHL_SOURCE || "Tergion website lead form",
  goHighLevelLeadTags: process.env.GHL_LEAD_TAGS || "website-lead",
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || "",
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  nodeEnv: process.env.NODE_ENV || "development",
};

export function hasGoogleSheetsConfig() {
  return Boolean(
    env.googleSheetsClientEmail &&
      env.googleSheetsPrivateKey &&
      env.googleSheetsSpreadsheetId,
  );
}

export function hasEmailConfig() {
  if (!env.emailProvider || !env.leadNotificationEmail) {
    return false;
  }

  if (env.emailProvider === "resend") {
    return Boolean(env.resendApiKey);
  }

  if (env.emailProvider === "postmark") {
    return Boolean(env.postmarkServerToken);
  }

  return false;
}

export function hasGoHighLevelConfig() {
  return Boolean(env.goHighLevelToken && env.goHighLevelLocationId);
}

export function hasUpstashRedisConfig() {
  return Boolean(env.upstashRedisRestUrl && env.upstashRedisRestToken);
}
