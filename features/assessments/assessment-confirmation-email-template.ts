import {
  getAssessmentDetailSections,
  getAssessmentFollowUpPreferenceLabel,
} from "@/features/assessments/assessment-formatters";
import type { AutomationAssessmentRecord } from "@/features/leads/lead.types";
import { siteConfig } from "@/lib/site-config";

export const assessmentConfirmationEmailSubject =
  "We received your automation assessment!";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderValue(value: string, multiline = false) {
  const escaped = escapeHtml(value);
  return multiline ? escaped.replace(/\r\n|\r|\n/g, "<br>") : escaped;
}

function getFollowUpCopy(lead: AutomationAssessmentRecord) {
  if (lead.assessmentFollowUpPreference === "confirmation-only") {
    return {
      heading: "Your preference is recorded",
      body: "You selected no follow-up beyond this confirmation email. Tergion will not initiate additional review or sales follow-up unless you contact us again.",
    };
  }

  if (lead.assessmentFollowUpPreference === "information-first") {
    return {
      heading: "Information first",
      body: "A person may provide introductory information before discussing a personalized automation review. No appointment or review has been scheduled.",
    };
  }

  return {
    heading: "What happens next",
    body: "A person will review your responses and may follow up using the contact preference you selected. Submitting this assessment does not book an appointment.",
  };
}

function getUrls() {
  const siteUrl = new URL(siteConfig.domain).origin;

  return {
    siteUrl,
    logoUrl: new URL(siteConfig.emailLogoPath, siteUrl).toString(),
    privacyUrl: new URL("/privacy", siteUrl).toString(),
    termsUrl: new URL("/terms", siteUrl).toString(),
    dataNoticeUrl: new URL("/data-notice", siteUrl).toString(),
  };
}

function renderDetailRows(lead: AutomationAssessmentRecord) {
  return getAssessmentDetailSections(lead)
    .map(
      (section) => `
        <tr>
          <td colspan="2" style="padding: 18px 16px 10px; background: #F5F8FD; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 700;">${escapeHtml(section.title)}</td>
        </tr>
        ${section.details
          .map(
            (detail) => `
              <tr>
                <td style="width: 38%; padding: 11px 16px; border-bottom: 1px solid #D8E3F2; color: #667085; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 20px; vertical-align: top;">${escapeHtml(detail.label)}</td>
                <td style="padding: 11px 16px; border-bottom: 1px solid #D8E3F2; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; line-height: 21px; overflow-wrap: anywhere; vertical-align: top;">${renderValue(detail.value, detail.multiline)}</td>
              </tr>`,
          )
          .join("")}`,
    )
    .join("");
}

export function renderAssessmentConfirmationEmailHtml(
  lead: AutomationAssessmentRecord,
) {
  const urls = getUrls();
  const followUp = getFollowUpCopy(lead);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <title>${assessmentConfirmationEmailSubject}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #F8FAFD; color: #132A46;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">A person reviews each submitted Tergion automation assessment.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background: #F8FAFD;">
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px; border: 1px solid #D8E3F2; border-radius: 16px; border-spacing: 0; overflow: hidden; background: #FFFFFF;">
            <tr><td style="height: 6px; background: #054CB3; font-size: 0; line-height: 0;">&nbsp;</td></tr>
            <tr>
              <td align="center" style="padding: 24px 24px 12px;">
                <img src="${escapeHtml(urls.logoUrl)}" width="220" alt="Tergion Technologies" style="display: block; width: 100%; max-width: 220px; height: auto; border: 0;">
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 28px;">
                <p style="margin: 0 0 10px; color: #0C327E; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase;">Assessment received</p>
                <h1 style="margin: 0; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 28px; line-height: 36px;">We received your automation assessment</h1>
                <p style="margin: 20px 0 0; color: #334155; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 25px;">Hi ${escapeHtml(lead.firstName)},</p>
                <p style="margin: 10px 0 0; color: #334155; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 25px;">Thanks for sharing information about ${escapeHtml(lead.businessName)}. A person reviews submitted assessments; this confirmation does not contain an automatic score or diagnosis.</p>
                <div style="margin: 20px 0 0; padding: 16px; border-left: 4px solid #054CB3; background: #F5F8FD;">
                  <p style="margin: 0; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 700; line-height: 22px;">${escapeHtml(followUp.heading)}</p>
                  <p style="margin: 6px 0 0; color: #526174; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 22px;">${escapeHtml(followUp.body)}</p>
                </div>
                <p style="margin: 18px 0 0; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 700;">No obligation. No pressure.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 24px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid #D8E3F2; border-radius: 12px; border-collapse: separate; border-spacing: 0; overflow: hidden; background: #FFFFFF;">
                  <tr><td colspan="2" style="padding: 18px 16px; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 17px; font-weight: 700;">Your assessment details</td></tr>
                  ${renderDetailRows(lead)}
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 24px; border-top: 1px solid #D8E3F2; background: #F8FAFD;">
                <p style="margin: 0; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 700;">Tergion Technologies</p>
                <p style="margin: 8px 0 0; color: #667085; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 19px;"><a href="mailto:${siteConfig.contactEmail}" style="color: #054CB3;">${siteConfig.contactEmail}</a> &nbsp;·&nbsp; <a href="${escapeHtml(urls.siteUrl)}" style="color: #054CB3;">${escapeHtml(urls.siteUrl)}</a></p>
                <p style="margin: 8px 0 0; color: #667085; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 19px;"><a href="${escapeHtml(urls.privacyUrl)}" style="color: #0C327E;">Privacy Policy</a> &nbsp;·&nbsp; <a href="${escapeHtml(urls.termsUrl)}" style="color: #0C327E;">Terms of Use</a> &nbsp;·&nbsp; <a href="${escapeHtml(urls.dataNoticeUrl)}" style="color: #0C327E;">Data Notice</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderAssessmentConfirmationEmailText(
  lead: AutomationAssessmentRecord,
) {
  const urls = getUrls();
  const followUp = getFollowUpCopy(lead);
  const details = getAssessmentDetailSections(lead)
    .flatMap((section) => [
      section.title.toUpperCase(),
      ...section.details.map((detail) => `${detail.label}: ${detail.value}`),
      "",
    ])
    .join("\n");

  return [
    `Hi ${lead.firstName},`,
    "",
    `We received the automation assessment for ${lead.businessName}. A person reviews submitted assessments; this confirmation does not contain an automatic score or diagnosis.`,
    "",
    followUp.heading,
    followUp.body,
    "",
    `Follow-up preference: ${getAssessmentFollowUpPreferenceLabel(lead)}`,
    "",
    "No obligation. No pressure.",
    "",
    details,
    "Tergion Technologies",
    siteConfig.contactEmail,
    urls.siteUrl,
    `Privacy Policy: ${urls.privacyUrl}`,
    `Terms of Use: ${urls.termsUrl}`,
    `Data Notice: ${urls.dataNoticeUrl}`,
  ].join("\n");
}
