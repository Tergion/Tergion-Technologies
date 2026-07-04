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
    "Tergion Technologies <hello@tergion.com>",
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
