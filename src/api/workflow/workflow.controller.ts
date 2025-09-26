/**
 * Workflow Automation Controller
 *
 * This controller handles background tasks and automated processes
 * for subscription management. It implements reminder notifications,
 * renewal processing, and other automated workflows using Upstash
 * QStash for reliable message queuing and scheduling.
 *
 * Features:
 * - Automated subscription renewal reminders
 * - Background task scheduling and execution
 * - Email notification system integration
 * - Date-based workflow triggers
 * - Error handling and logging
 *
 * Endpoints:
 * - POST /api/v1/workflows/subscriptions/reminder - Trigger subscription reminder workflow
 */

import { serve } from "@upstash/workflow/hono";
import Subscription from "../subscriptions/subscription.model";
import dayjs from "dayjs";
import sendMail from "../../core/resend";

// Array of days before renewal date to send reminders
// Configurable reminder intervals: 7, 5, 2, and 1 days before renewal
const REMINDERS = [7, 5, 2, 1];

/**
 * Sends reminders for a subscription at specified intervals before renewal date
 *
 * This workflow function handles automated subscription renewal reminders by:
 * 1. Fetching subscription details with user information
 * 2. Checking subscription status and renewal date validity
 * 3. Scheduling reminder emails at specified intervals before renewal
 * 4. Executing reminder actions when scheduled dates are reached
 *
 * The workflow uses Upstash's sleep functionality to delay execution
 * until the appropriate reminder dates, ensuring timely notifications.
 *
 * @param context - Workflow context containing request payload and workflow methods
 *
 * Workflow Payload:
 * {
 *   "subscriptionId": "subscription_object_id"
 * }
 *
 * Process Flow:
 * 1. Validate subscription exists and is active
 * 2. Check renewal date hasn't passed
 * 3. Schedule reminders for each configured interval
 * 4. Send email notifications when reminder dates are reached
 */
export const sendReminders = serve(async (context) => {
  // Extract subscription ID from the workflow request payload
  const { subscriptionId } = context.requestPayload as {
    subscriptionId: string;
  };

  // Fetch the subscription with populated user data
  // This ensures we have both subscription details and user information
  const subscription = await fetchSubscription(context, subscriptionId);

  // If subscription doesn't exist or isn't active, exit the workflow
  // This prevents unnecessary processing of invalid or expired subscriptions
  if (!subscription || subscription.status !== "active") return;

  // Parse the renewal date using dayjs for date manipulation
  const renewalDate = dayjs(subscription.renewalDate);

  // If renewal date has already passed, exit the workflow
  // This avoids sending reminders for subscriptions that are already overdue
  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date for subscription ${subscriptionId} has already passed. Stopping workflow.`
    );
    return;
  }

  // Loop through each reminder interval to schedule notifications
  for (const daysBefore of REMINDERS) {
    // Calculate the reminder date by subtracting days from renewal date
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    // If reminder date is in the future, sleep until that date
    // This delays the workflow execution until the reminder should be sent
    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `Reminder ${daysBefore} days before`,
        reminderDate
      );
    }

    // Trigger the reminder action when the scheduled date is reached
    // This sends the actual email notification to the user
    await triggerReminder(
      context,
      `Reminder ${daysBefore} ${dayordays(daysBefore)} before`,
      subscription
    );
  }
});

/**
 * Fetches a subscription by ID with populated user data
 * @param context - Workflow context
 * @param subscriptionId - ID of the subscription to fetch
 * @returns The subscription document or null if not found
 */
const fetchSubscription = async (
  context: any,
  subscriptionId: string
): Promise<any> => {
  return await context.run("get subscription", () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });
};

/**
 * Pauses the workflow execution until a specific date
 * @param context - Workflow context
 * @param label - Description of the sleep period
 * @param date - The date to sleep until
 */
const sleepUntilReminder = async (
  context: any,
  label: string,
  date: dayjs.Dayjs
) => {
  console.log(`Sleeping until ${label} reminder at ${date.toISOString()}`);
  await context.sleepUntil(label, date.toDate());
};

/**
 * Triggers a reminder action (currently just a placeholder for email sending)
 * @param context - Workflow context
 * @param label - Description of the reminder being triggered
 */
const triggerReminder = async (
  context: any,
  label: string,
  subscription: any
) => {
  return await context.run(`Triggering ${label} reminder`);

  await sendMail({
    to: subscription.user.email,
    type: label,
    subscription,
  });
};

/**
 * Helper function to return correct singular/plural form of "day"
 * @param days - Number of days
 * @returns "day" if 1, "days" otherwise
 */
const dayordays = (days: number) => {
  return days === 1 ? "day" : "days";
};
