/**
 * CrossTech website Cloud Functions.
 *
 * sendLeadEmails — fires when the contact form writes a document into the
 * `leads` collection. Sends (1) the auto-reply email to the visitor using
 * the `message` payload the website already writes, and (2) an internal
 * notification to the CrossTech inbox. Marks the lead with `emailSent`.
 *
 * SMTP configuration comes from Firebase params/secrets — NEVER from this
 * public repo. On first deploy the CLI prompts for:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, MAIL_FROM, MAIL_NOTIFY (params)
 *   SMTP_PASS (secret: `firebase functions:secrets:set SMTP_PASS`)
 */
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {defineSecret, defineString} from "firebase-functions/params";
import {logger} from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

const smtpHost = defineString("SMTP_HOST");
const smtpPort = defineString("SMTP_PORT", {default: "465"});
const smtpUser = defineString("SMTP_USER");
const smtpPass = defineSecret("SMTP_PASS");
const mailFrom = defineString("MAIL_FROM", {
  default: "CrossTech <info@crosstech.solutions>",
});
const mailNotify = defineString("MAIL_NOTIFY", {
  default: "info@crosstech.solutions",
});

interface LeadMessage {
  subject?: string;
  html?: string;
  text?: string;
  ccUids?: string;
}

interface Lead {
  name?: string;
  subject?: string;
  to?: string;
  query?: string;
  message?: LeadMessage;
  reference?: string;
  emailSent?: boolean;
}

export const sendLeadEmails = onDocumentCreated(
    {document: "leads/{leadId}", secrets: [smtpPass]},
    async (event) => {
      const snap = event.data;
      if (!snap) {
        logger.warn("sendLeadEmails: event carried no snapshot");
        return;
      }
      const lead = snap.data() as Lead;
      if (lead.emailSent) {
        logger.info("sendLeadEmails: already sent, skipping", {
          leadId: event.params.leadId,
        });
        return;
      }
      if (!lead.to || !lead.message) {
        logger.warn("sendLeadEmails: lead missing `to` or `message`", {
          leadId: event.params.leadId,
        });
        return;
      }

      const port = parseInt(smtpPort.value(), 10);
      const transporter = nodemailer.createTransport({
        host: smtpHost.value(),
        port: port,
        secure: port === 465,
        auth: {
          user: smtpUser.value(),
          pass: smtpPass.value(),
        },
      });

      const ref = lead.reference ?? event.params.leadId;

      try {
        // 1. Auto-reply to the visitor (payload written by the website).
        await transporter.sendMail({
          from: mailFrom.value(),
          to: lead.to,
          subject: lead.message.subject ??
            `CrossTech website query - ${ref}`,
          text: lead.message.text,
          html: lead.message.html,
        });

        // 2. Internal notification with the lead's content.
        await transporter.sendMail({
          from: mailFrom.value(),
          to: mailNotify.value(),
          replyTo: lead.to,
          subject: `New website lead ${ref}: ${lead.subject ?? ""}`,
          text: [
            `Reference: ${ref}`,
            `Name: ${lead.name ?? ""}`,
            `Email: ${lead.to}`,
            `Subject: ${lead.subject ?? ""}`,
            "",
            lead.query ?? "",
          ].join("\n"),
        });

        await snap.ref.update({emailSent: true});
        logger.info("sendLeadEmails: sent", {leadId: event.params.leadId});
      } catch (err) {
        logger.error("sendLeadEmails: failed", err);
        await snap.ref.update({emailSentError: String(err)});
      }
    },
);
