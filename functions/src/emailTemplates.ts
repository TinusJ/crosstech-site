/**
 * CrossTech transactional email templates.
 *
 * Composes the contact-form auto-reply and the internal lead
 * notification server-side, so the website only writes plain data
 * fields to Firestore. Email-client-safe HTML: table-based layout,
 * all styles inline, max-width 600px, no images or external assets,
 * light background with brand-color accents (works in Gmail and
 * Outlook). Every user-provided value is HTML-escaped before it is
 * interpolated.
 */

export interface LeadEmailData {
  name?: string;
  subject?: string;
  to?: string;
  query?: string;
  receivedAt?: Date;
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const SITE_URL = "https://crosstech.solutions";
const SITE_LABEL = "crosstech.solutions";
const MAIL_ADDR = "info@crosstech.solutions";

const FONT = "font-family:Arial,Helvetica,sans-serif;";
const MONO = "font-family:Courier,monospace;";

/**
 * Escapes a user-provided value for safe interpolation into HTML.
 *
 * @param {string} value Raw string (possibly attacker-controlled).
 * @return {string} The value with HTML metacharacters escaped.
 */
export function escapeHtml(value: string): string {
  return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
}

/**
 * Escapes a value and converts newlines to `<br>` for HTML display.
 *
 * @param {string} value Raw multi-line string.
 * @return {string} Escaped HTML with line breaks preserved.
 */
function toHtmlLines(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

/**
 * Collapses CR/LF so a user value is safe inside a mail header.
 *
 * @param {string} value Raw single-line-intended string.
 * @return {string} The value with line breaks replaced by spaces.
 */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Wraps card rows in the shared outer shell (light page background
 * with a centered 600px white card).
 *
 * @param {string[]} rows HTML `<tr>` rows for the card table.
 * @return {string} Full HTML email body.
 */
function shell(rows: string[]): string {
  return [
    "<div style='background:#eef1f5;padding:32px 12px;margin:0;'>",
    "<table role='presentation' width='100%' cellpadding='0'",
    " cellspacing='0' border='0'><tr><td align='center'>",
    "<table role='presentation' width='600' cellpadding='0'",
    " cellspacing='0' border='0' style='width:600px;",
    "max-width:600px;background:#ffffff;border-collapse:collapse;'>",
    ...rows,
    "</table></td></tr></table></div>",
  ].join("");
}

/**
 * Builds the dark header row with the CrossTech text wordmark.
 *
 * @param {boolean} compact Slimmer variant for internal emails.
 * @return {string} HTML for the header `<tr>`.
 */
function headerRow(compact: boolean): string {
  const pad = compact ? "18px 32px" : "28px 32px";
  const size = compact ? "20px" : "26px";
  const tagline = compact ? "" : [
    "<div style='", FONT, "font-size:12px;color:#38a9dc;",
    "padding-top:6px;letter-spacing:0.5px;'>",
    "AI-first software studio</div>",
  ].join("");
  return [
    "<tr><td style='background:#081119;",
    "border-top:4px solid #f0632c;padding:", pad, ";'>",
    "<span style='", FONT, "font-size:", size, ";font-weight:bold;",
    "color:#e8ecf4;letter-spacing:0.5px;'>CrossTech<span ",
    "style='color:#f0632c;'>.</span></span>",
    tagline,
    "</td></tr>",
  ].join("");
}

/**
 * Builds the footer row (contact details, muted).
 *
 * @return {string} HTML for the footer `<tr>`.
 */
function footerRow(): string {
  return [
    "<tr><td style='padding:20px 32px 24px;background:#ffffff;",
    "border-top:1px solid #e4e8ee;'>",
    "<p style='", FONT, "font-size:12px;line-height:19px;",
    "color:#8a94a3;margin:0;'>CrossTech &middot; ",
    "AI-first software studio<br>",
    "<a href='mailto:", MAIL_ADDR, "' style='color:#1982ad;",
    "text-decoration:none;'>", MAIL_ADDR, "</a> &middot; ",
    "<a href='", SITE_URL, "' style='color:#1982ad;",
    "text-decoration:none;'>", SITE_LABEL, "</a></p>",
    "</td></tr>",
  ].join("");
}

/**
 * Builds a body paragraph with the standard copy style.
 *
 * @param {string} html Inner HTML (already escaped where needed).
 * @return {string} A styled `<p>` element.
 */
function para(html: string): string {
  return [
    "<p style='", FONT, "font-size:15px;line-height:23px;",
    "color:#2a3440;margin:0 0 16px;'>", html, "</p>",
  ].join("");
}

/**
 * Builds a label/value row for the internal notification table.
 *
 * @param {string} label Field label (trusted, not escaped).
 * @param {string} valueHtml Field value as escaped/safe HTML.
 * @return {string} HTML `<tr>` for the details table.
 */
function detailRow(label: string, valueHtml: string): string {
  return [
    "<tr><td valign='top' style='", FONT, "font-size:11px;",
    "font-weight:bold;color:#5a6673;text-transform:uppercase;",
    "letter-spacing:1px;padding:10px 0;width:110px;",
    "border-bottom:1px solid #edf0f4;'>", label, "</td>",
    "<td style='", FONT, "font-size:14px;line-height:21px;",
    "color:#081119;padding:10px 0 10px 14px;",
    "border-bottom:1px solid #edf0f4;'>", valueHtml, "</td></tr>",
  ].join("");
}

/**
 * Builds the branded auto-reply email sent to the visitor.
 *
 * @param {LeadEmailData} lead The lead document's data fields.
 * @param {string} reference The 10-char reference shown on-site.
 * @return {EmailContent} Subject, HTML body and plain-text body.
 */
export function buildAutoReplyEmail(
    lead: LeadEmailData, reference: string): EmailContent {
  const firstName =
    (lead.name ?? "").trim().split(/\s+/)[0] || "there";
  const safeFirst = escapeHtml(firstName);
  const safeSubject = escapeHtml(lead.subject ?? "");
  const safeQuery = toHtmlLines(lead.query ?? "");
  const safeRef = escapeHtml(reference);

  const bodyRow = [
    "<tr><td style='padding:32px 32px 24px;'>",
    para("Hi " + safeFirst + ","),
    para("Thanks for getting in touch with CrossTech. This is an " +
      "automated confirmation that your message has arrived " +
      "safely. One of us will get back to you within " +
      "<strong>one to two working days</strong>."),
    "<table role='presentation' width='100%' cellpadding='0'",
    " cellspacing='0' border='0' style='margin:24px 0;'><tr>",
    "<td align='center' style='background:#fdf1ea;",
    "border:1px solid #f6c9ae;padding:18px 20px;'>",
    "<span style='", FONT, "font-size:11px;font-weight:bold;",
    "color:#5a6673;text-transform:uppercase;letter-spacing:2px;'>",
    "Your reference number</span><br>",
    "<span style='", MONO, "font-size:26px;font-weight:bold;",
    "color:#f0632c;letter-spacing:2px;'>", safeRef, "</span>",
    "</td></tr></table>",
    "<p style='", FONT, "font-size:11px;font-weight:bold;",
    "color:#5a6673;text-transform:uppercase;letter-spacing:1px;",
    "margin:24px 0 8px;'>What you sent us</p>",
    "<table role='presentation' width='100%' cellpadding='0'",
    " cellspacing='0' border='0'><tr>",
    "<td style='background:#f4f6f8;",
    "border-left:3px solid #38a9dc;padding:16px 20px;'>",
    "<span style='", FONT, "font-size:14px;font-weight:bold;",
    "color:#081119;'>", safeSubject, "</span>",
    "<p style='", FONT, "font-size:14px;line-height:21px;",
    "color:#2a3440;margin:8px 0 0;'>", safeQuery, "</p>",
    "</td></tr></table>",
    "<table role='presentation' cellpadding='0' cellspacing='0'",
    " border='0' align='center' style='margin:28px auto 8px;'>",
    "<tr><td align='center' bgcolor='#f0632c'",
    " style='border-radius:4px;'>",
    "<a href='", SITE_URL, "' style='", FONT,
    "display:inline-block;padding:12px 30px;font-size:14px;",
    "font-weight:bold;color:#ffffff;text-decoration:none;'>",
    "Visit ", SITE_LABEL, "</a>",
    "</td></tr></table>",
    "</td></tr>",
  ].join("");

  const html = shell([headerRow(false), bodyRow, footerRow()]);

  const text = [
    "Hi " + firstName + ",",
    "",
    "Thanks for getting in touch with CrossTech. This is an",
    "automated confirmation that your message has arrived safely.",
    "One of us will get back to you within one to two working days.",
    "",
    "Your reference number: " + reference,
    "",
    "What you sent us",
    "Subject: " + (lead.subject ?? ""),
    lead.query ?? "",
    "",
    SITE_URL,
    "CrossTech - " + MAIL_ADDR,
  ].join("\n");

  const subject = "We've received your message — ref " +
    headerSafe(reference) + " | CrossTech";

  return {subject, html, text};
}

/**
 * Builds the internal lead-notification email.
 *
 * @param {LeadEmailData} lead The lead document's data fields.
 * @param {string} reference The 10-char reference shown on-site.
 * @return {EmailContent} Subject, HTML body and plain-text body.
 */
export function buildNotificationEmail(
    lead: LeadEmailData, reference: string): EmailContent {
  const safeRef = escapeHtml(reference);
  const safeName = escapeHtml(lead.name ?? "");
  const safeTo = escapeHtml(lead.to ?? "");
  const safeSubject = escapeHtml(lead.subject ?? "");
  const safeQuery = toHtmlLines(lead.query ?? "");
  const received =
    lead.receivedAt ? lead.receivedAt.toUTCString() : "";

  const bodyRow = [
    "<tr><td style='padding:24px 32px 20px;'>",
    "<p style='", FONT, "font-size:15px;line-height:22px;",
    "color:#2a3440;margin:0 0 14px;'>",
    "New lead from the website contact form.</p>",
    "<table role='presentation' width='100%' cellpadding='0'",
    " cellspacing='0' border='0'>",
    detailRow("Reference", [
      "<span style='", MONO, "font-size:15px;font-weight:bold;",
      "color:#f0632c;letter-spacing:1px;'>", safeRef, "</span>",
    ].join("")),
    detailRow("Name", safeName),
    detailRow("Email", [
      "<a href='mailto:", safeTo, "' style='color:#1982ad;",
      "text-decoration:none;'>", safeTo, "</a>",
    ].join("")),
    detailRow("Subject", safeSubject),
    detailRow("Message", safeQuery),
    detailRow("Received", escapeHtml(received)),
    "</table>",
    "<p style='", FONT, "font-size:12px;line-height:18px;",
    "color:#8a94a3;margin:14px 0 0;'>",
    "Reply to this email to answer the visitor directly.</p>",
    "</td></tr>",
  ].join("");

  const html = shell([headerRow(true), bodyRow, footerRow()]);

  const text = [
    "New lead from the website contact form.",
    "",
    "Reference: " + reference,
    "Name: " + (lead.name ?? ""),
    "Email: " + (lead.to ?? ""),
    "Subject: " + (lead.subject ?? ""),
    "",
    lead.query ?? "",
    "",
    "Received: " + received,
  ].join("\n");

  const subject = "New website lead " + headerSafe(reference) +
    ": " + headerSafe(lead.subject ?? "");

  return {subject, html, text};
}
