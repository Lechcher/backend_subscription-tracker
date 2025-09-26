/**
 * Resend Email Service Configuration
 *
 * This file handles email sending functionality using the Resend service.
 * It manages email templates, constructs email content, and sends
 * transactional emails for subscription notifications and user communications.
 *
 * Features:
 * - Email template management with dynamic content
 * - Automatic email content generation based on subscription data
 * - Error handling for email sending failures
 * - Integration with subscription data for personalized emails
 *
 * Usage:
 * import sendMail from './resend';
 *
 * Example:
 * await sendMail({
 *   to: 'user@example.com',
 *   type: 'renewal_reminder',
 *   subscription: subscriptionData
 * });
 */

import { Resend } from "resend";
import { RESEND_API_KEY } from "./env";
import { emailTemplates } from "../utils/email-template";
import dayjs from "dayjs";

// Initialize Resend client with API key
const resend = new Resend(RESEND_API_KEY);

/**
 * Email sending options interface
 * Defines the structure for email sending parameters
 */
interface SendMailOptions {
  to: string; // Recipient email address
  type: string; // Email template type identifier
  subscription: any; // Subscription data for email content
}

/**
 * Sends an email using Resend service with dynamic content
 *
 * @param options - Email configuration options
 * @throws Error if required fields are missing or template is invalid
 */
const sendMail = async ({ to, type, subscription }: SendMailOptions) => {
  try {
    // Validate required fields
    if (!to && !type) throw new Error("Missing required fields");

    // Find the appropriate email template based on type
    const template = emailTemplates.find((t) => t.label === type);

    if (!template) throw new Error("Invalid email type");

    // Prepare email information from subscription data
    const mailInfo = {
      userName: subscription.user.name,
      subscription: subscription.name,
      renewalDate: dayjs(subscription.renewalDate).format("MMMM D, YYYY"),
      planName: subscription.name,
      price: `${subscription.price} ${subscription.currency} (${subscription.frequency})`,
      paymentMethod: subscription.paymentMethod,
    };

    // Generate email subject and body using template
    const message = template.generateBody(mailInfo as any);
    const subject = template.generateSubject(mailInfo as any);

    // Send email using Resend service
    await resend.emails.send({
      from: "Lechcher <no-reply@subscription.tracker>", // Sender email address
      to: to, // Recipient email address
      subject: subject, // Email subject line
      html: message, // Email body in HTML format
    });

    console.log("Email sent to:", to);
  } catch (error) {
    // Log email sending errors for debugging
    if (error) {
      console.error("Error sending email:", error);
    }
  }
};

export default sendMail;
