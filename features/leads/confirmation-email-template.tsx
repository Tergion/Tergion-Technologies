import {
  preferredContactMethods,
  usesCrmOptions,
} from "@/features/leads/lead.constants";
import type { QuickRequestRecord } from "@/features/leads/lead.types";
import { siteConfig } from "@/lib/site-config";

export const confirmationEmailSubject = "We received your request!";
export const confirmationEmailPreheader =
  "We’ll review your request and follow up based on your preferred contact method.";

type ConfirmationDetail = {
  label: string;
  value: string;
  multiline?: boolean;
};

function cleanOptionalValue(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMultilineHtml(value: string) {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}

function getPreferredContactLabel(lead: QuickRequestRecord) {
  return (
    preferredContactMethods.find(
      (method) => method.value === lead.preferredContactMethod,
    )?.label ?? lead.preferredContactMethod
  );
}

function getUsesCrmLabel(lead: QuickRequestRecord) {
  return (
    usesCrmOptions.find((option) => option.value === lead.usesCrm)?.label ??
    lead.usesCrm
  );
}

function getConfirmationDetails(lead: QuickRequestRecord): ConfirmationDetail[] {
  const lastName = cleanOptionalValue(lead.lastName);
  const phone = cleanOptionalValue(lead.phone);
  const website = cleanOptionalValue(lead.website);
  const currentCrm = cleanOptionalValue(lead.currentCrm);
  const priority = cleanOptionalValue(lead.requestPriority);
  const notes = cleanOptionalValue(lead.notes);
  const details: ConfirmationDetail[] = [
    {
      label: "Name",
      value: [lead.firstName, lastName].filter(Boolean).join(" "),
    },
    { label: "Business name", value: lead.businessName },
    { label: "Email", value: lead.email },
    {
      label: "Preferred contact method",
      value: getPreferredContactLabel(lead),
    },
    { label: "Scheduling preference", value: lead.schedulingPreference },
  ];

  if (phone) {
    details.push({ label: "Phone", value: phone });
  }

  if (website) {
    details.push({ label: "Website", value: website });
  }

  if (lead.usesCrm !== "not-sure" || currentCrm) {
    details.push({ label: "CRM use", value: getUsesCrmLabel(lead) });
  }

  if (currentCrm) {
    details.push({ label: "Current CRM", value: currentCrm });
  }

  if (priority) {
    details.push({ label: "Priority", value: priority });
  }

  if (lead.automationInterests.length) {
    details.push({
      label: "Automation interests",
      value: lead.automationInterests.join(", "),
    });
  }

  if (notes) {
    details.push({ label: "Notes", value: notes, multiline: true });
  }

  return details;
}

function getEmailUrls() {
  const siteUrl = new URL(siteConfig.domain).origin;

  return {
    siteUrl,
    logoUrl: new URL(siteConfig.emailLogoPath, siteUrl).toString(),
    privacyUrl: new URL("/privacy", siteUrl).toString(),
    termsUrl: new URL("/terms", siteUrl).toString(),
    dataNoticeUrl: new URL("/data-notice", siteUrl).toString(),
  };
}

function formatSubmissionDate(createdAt: string) {
  const submissionDate = new Date(createdAt);

  if (Number.isNaN(submissionDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(submissionDate);
}

function renderDetailRows(details: ConfirmationDetail[]) {
  return details
    .map(
      (detail) => `
        <tr>
          <td style="width: 38%; padding: 12px 16px; border-bottom: 1px solid #D8E3F2; color: #667085; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 20px; vertical-align: top;">${escapeHtml(detail.label)}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #D8E3F2; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; line-height: 21px; overflow-wrap: anywhere; vertical-align: top;">${detail.multiline ? renderMultilineHtml(detail.value) : escapeHtml(detail.value)}</td>
        </tr>`,
    )
    .join("");
}

function renderNextStep(number: string, title: string, description: string) {
  return `
    <tr>
      <td style="padding: 0 0 16px 0; vertical-align: top; width: 40px;">
        <div style="box-sizing: border-box; width: 28px; height: 28px; border: 1px solid #054CB3; border-radius: 50%; background-color: #FFFFFF; color: #054CB3; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; line-height: 26px; text-align: center;">${number}</div>
      </td>
      <td style="padding: 0 0 16px 0; vertical-align: top;">
        <p style="margin: 0; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 700; line-height: 21px;">${title}</p>
        <p style="margin: 3px 0 0; color: #526174; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 21px;">${description}</p>
      </td>
    </tr>`;
}

export function renderConfirmationEmailHtml(lead: QuickRequestRecord) {
  const details = getConfirmationDetails(lead);
  const urls = getEmailUrls();
  const contactEmail = siteConfig.contactEmail;
  const submissionDate = formatSubmissionDate(lead.createdAt);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <title>${confirmationEmailSubject}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #F8FAFD; color: #132A46;">
    <div style="display: none; max-height: 0; max-width: 0; overflow: hidden; opacity: 0; color: transparent; mso-hide: all;">${confirmationEmailPreheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background-color: #F8FAFD; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px; background-color: #FFFFFF; border: 1px solid #D8E3F2; border-collapse: separate; border-spacing: 0; border-radius: 16px; overflow: hidden;">
            <tr>
              <td style="height: 6px; background-color: #054CB3; font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding: 10px 24px 20px; background-color: #FFFFFF;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="right" height="18" style="height: 18px; color: #667085; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; white-space: nowrap;">${escapeHtml(submissionDate)}</td>
                  </tr>
                  <tr>
                    <td align="center">
                      <img src="${escapeHtml(urls.logoUrl)}" width="240" alt="Tergion Technologies" style="display: block; width: 100%; max-width: 240px; height: auto; border: 0; outline: none; text-decoration: none;">
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 32px 32px; background-color: #FFFFFF;">
                <p style="margin: 0 0 10px; color: #0C327E; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; line-height: 18px; text-transform: uppercase;">Confirmation</p>
                <h1 style="margin: 0; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 30px; font-weight: 700; letter-spacing: -0.4px; line-height: 38px;">Request received</h1>
                <p style="margin: 24px 0 0; color: #334155; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 25px;">Hi ${escapeHtml(lead.firstName)},</p>
                <p style="margin: 12px 0 0; color: #334155; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 25px;">Thanks for reaching out to Tergion Technologies. We received your request and will review the information before following up based on your preferred contact method.</p>
                <p style="margin: 18px 0 0; padding: 14px 16px; border-left: 4px solid #054CB3; background-color: #F5F8FD; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 700; line-height: 23px;">No obligation. No pressure. We’ll start with the basics and go from there.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 24px 24px; background-color: #FFFFFF;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid #D8E3F2; border-collapse: separate; border-spacing: 0; border-radius: 12px; overflow: hidden; background-color: #FFFFFF;">
                  <tr>
                    <td colspan="2" style="padding: 18px 16px 12px; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 17px; font-weight: 700; line-height: 24px;">Your request details</td>
                  </tr>${renderDetailRows(details)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 24px 24px; background-color: #FFFFFF;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid #D8E3F2; border-collapse: separate; border-spacing: 0; border-radius: 12px; background-color: #F5F8FD;">
                  <tr>
                    <td style="padding: 20px 20px 4px;">
                      <h2 style="margin: 0 0 18px; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 19px; font-weight: 700; line-height: 27px;">What happens next</h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                        ${renderNextStep("1", "We review the request.", "We’ll look through the information you provided.")}
                        ${renderNextStep("2", "We follow up.", "We’ll use your preferred contact method and scheduling preference.")}
                        ${renderNextStep("3", "We discuss useful next steps.", "If there is a fit, we’ll talk through practical options without pressure.")}
                      </table>
                      <p style="margin: 0 0 18px; color: #526174; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 20px;">Submitting this request does not confirm an appointment. Tergion will follow up based on the scheduling preference you provided.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 24px 28px; background-color: #FFFFFF;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid #D8E3F2; border-collapse: separate; border-spacing: 0; border-radius: 12px; background-color: #F8FAFD;">
                  <tr>
                    <td style="padding: 18px 20px;">
                      <p style="margin: 0; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 700; line-height: 22px;">This is an automated email</p>
                      <p style="margin: 6px 0 0; color: #526174; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 21px;">Replies to this mailbox are not monitored. If you need to change something, contact us at <a href="mailto:${contactEmail}" style="color: #054CB3; text-decoration: underline;">${contactEmail}</a>.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 24px; border-top: 1px solid #D8E3F2; background-color: #F8FAFD;">
                <p style="margin: 0; color: #132A46; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 700; line-height: 21px;">Tergion Technologies</p>
                <p style="margin: 6px 0 0; color: #667085; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 19px;"><a href="mailto:${contactEmail}" style="color: #054CB3; text-decoration: underline;">${contactEmail}</a> &nbsp;·&nbsp; <a href="${escapeHtml(urls.siteUrl)}" style="color: #054CB3; text-decoration: underline;">${escapeHtml(urls.siteUrl)}</a></p>
                <p style="margin: 10px 0 0; color: #667085; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 19px;"><a href="${escapeHtml(urls.privacyUrl)}" style="color: #0C327E; text-decoration: underline;">Privacy Policy</a> &nbsp;·&nbsp; <a href="${escapeHtml(urls.termsUrl)}" style="color: #0C327E; text-decoration: underline;">Terms of Use</a> &nbsp;·&nbsp; <a href="${escapeHtml(urls.dataNoticeUrl)}" style="color: #0C327E; text-decoration: underline;">Data Notice</a></p>
                <p style="margin: 16px 0 0; color: #7a8492; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 17px;">This is a transactional confirmation email related to a request submitted through tergion.com.</p>
                <p style="margin: 8px 0 0; color: #7a8492; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 17px;">If you did not submit this request, you can ignore this email or contact us at <a href="mailto:${contactEmail}" style="color: #0C327E; text-decoration: underline;">${contactEmail}</a>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderConfirmationEmailText(lead: QuickRequestRecord) {
  const details = getConfirmationDetails(lead)
    .map((detail) => `${detail.label}: ${detail.value}`)
    .join("\n");
  const urls = getEmailUrls();
  const contactEmail = siteConfig.contactEmail;

  return [
    `Hi ${lead.firstName},`,
    "",
    "Thanks for reaching out to Tergion Technologies. We received your request and will review the information before following up based on your preferred contact method.",
    "",
    "No obligation. No pressure. We’ll start with the basics and go from there.",
    "",
    "YOUR REQUEST DETAILS",
    details,
    "",
    "WHAT HAPPENS NEXT",
    "1. We review the request.",
    "2. We follow up using your preferred contact method and scheduling preference.",
    "3. We discuss useful next steps if there is a fit.",
    "",
    "Submitting this request does not confirm an appointment. Tergion will follow up based on the scheduling preference you provided.",
    "",
    `This is an automated email. Replies to ${siteConfig.transactionalEmail.replyTo} are not monitored.`,
    `If anything looks incorrect, contact us at ${contactEmail}.`,
    "",
    "Tergion Technologies",
    contactEmail,
    urls.siteUrl,
    `Privacy Policy: ${urls.privacyUrl}`,
    `Terms of Use: ${urls.termsUrl}`,
    `Data Notice: ${urls.dataNoticeUrl}`,
    "",
    "This is a transactional confirmation email related to a request submitted through tergion.com.",
    `If you did not submit this request, you can ignore this email or contact us at ${contactEmail}.`,
  ].join("\n");
}
