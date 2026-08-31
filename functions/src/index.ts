/**
 * CrossTech website Cloud Functions.
 *
 * sendLeadEmails — fires when the contact form writes a document into
 * the `leads` collection. Composes both emails server-side from the
 * lead's data fields (see emailTemplates.ts) and sends (1) a branded
 * auto-reply to the visitor and (2) an internal notification to the
 * CrossTech inbox. Marks the lead with `emailSent`. Any `message`
 * payload written by old cached pages is ignored.
 *
 * Sends through Gmail (Google Workspace) using OAuth2 — the supported
 * way for server apps; no app passwords involved. Configuration comes
 * from Firebase params/secrets — NEVER from this public repo:
 *   params : SMTP_USER (the Workspace user, e.g.
 *            tinus@crosstech.solutions),
 *            GMAIL_CLIENT_ID, MAIL_FROM, MAIL_NOTIFY
 *   secrets: GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 * One-time Google setup (OAuth consent screen, client ID, refresh
 * token via OAuth playground) is documented in docs/architecture.md.
 */
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {defineSecret, defineString} from "firebase-functions/params";
import {logger} from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import {
  buildAutoReplyEmail,
  buildNotificationEmail,
} from "./emailTemplates";

admin.initializeApp();

const smtpUser = defineString("SMTP_USER");
const clientId = defineString("GMAIL_CLIENT_ID");
const clientSecret = defineSecret("GMAIL_CLIENT_SECRET");
const refreshToken = defineSecret("GMAIL_REFRESH_TOKEN");
const mailFrom = defineString("MAIL_FROM", {
  default: "CrossTech <info@crosstech.solutions>",
});
const mailNotify = defineString("MAIL_NOTIFY", {
  default: "info@crosstech.solutions",
});

interface Lead {
  name?: string;
  subject?: string;
  to?: string;
  query?: string;
  reference?: string;
  timestamp?: admin.firestore.Timestamp;
  emailSent?: boolean;
}

export const sendLeadEmails = onDocumentCreated(
    {document: "leads/{leadId}", secrets: [clientSecret, refreshToken]},
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
      if (!lead.to) {
        logger.warn("sendLeadEmails: lead missing `to`", {
          leadId: event.params.leadId,
        });
        return;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: smtpUser.value(),
          clientId: clientId.value(),
          clientSecret: clientSecret.value(),
          refreshToken: refreshToken.value(),
        },
      });

      const ref = lead.reference ?? event.params.leadId;
      const leadData = {
        name: lead.name,
        subject: lead.subject,
        to: lead.to,
        query: lead.query,
        receivedAt: lead.timestamp ?
          lead.timestamp.toDate() : new Date(),
      };
      const autoReply = buildAutoReplyEmail(leadData, ref);
      const notification = buildNotificationEmail(leadData, ref);

      try {
        // 1. Branded auto-reply to the visitor.
        await transporter.sendMail({
          from: mailFrom.value(),
          to: lead.to,
          subject: autoReply.subject,
          text: autoReply.text,
          html: autoReply.html,
        });

        // 2. Internal notification with the lead's content.
        await transporter.sendMail({
          from: mailFrom.value(),
          to: mailNotify.value(),
          replyTo: lead.to,
          subject: notification.subject,
          text: notification.text,
          html: notification.html,
        });

        await snap.ref.update({emailSent: true});
        logger.info("sendLeadEmails: sent", {leadId: event.params.leadId});
      } catch (err) {
        logger.error("sendLeadEmails: failed", err);
        await snap.ref.update({emailSentError: String(err)});
      }
    },
);
