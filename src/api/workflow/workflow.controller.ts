import { serve } from "@upstash/workflow/hono";
import Subscription from "../subscriptions/subscription.model";
import dayjs from "dayjs";

// Array of days before renewal date to send reminders
const REMINDERS = [7, 5, 2, 1];

/**
 * Sends reminders for a subscription at specified intervals before renewal date
 * @param context - Workflow context containing request payload and workflow methods
 */
export const sendReminders = serve(async (context) => {
  // Extract subscription ID from the workflow request payload
  const { subscriptionId } = context.requestPayload as {
    subscriptionId: string;
  };

  // Fetch the subscription with populated user data
  const subscription = await fetchSubscription(context, subscriptionId);

  // If subscription doesn't exist or isn't active, exit the workflow
  if (!subscription || subscription.status !== "active") return;

  // Parse the renewal date using dayjs
  const renewalDate = dayjs(subscription.renewalDate);

  // If renewal date has already passed, exit the workflow
  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date for subscription ${subscriptionId} has already passed. Stopping workflow.`
    );
    return;
  }

  // Loop through each reminder interval
  for (const daysBefore of REMINDERS) {
    // Calculate the reminder date by subtracting days from renewal date
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    // If reminder date is in the future, sleep until that date
    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `Reminder ${daysBefore} ${dayordays} before`,
        reminderDate
      );
    }

    // Trigger the reminder action
    await triggerReminder(
      context,
      `Reminder ${daysBefore} ${dayordays(daysBefore)} before`
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
const triggerReminder = async (context: any, label: string) => {
  return await context.run(`Triggering ${label} reminder`);

  // TODO: Implement email sending functionality
  // Send email
};

/**
 * Helper function to return correct singular/plural form of "day"
 * @param days - Number of days
 * @returns "day" if 1, "days" otherwise
 */
const dayordays = (days: number) => {
  return days === 1 ? "day" : "days";
};
