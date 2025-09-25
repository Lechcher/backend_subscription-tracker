import { type Context } from "hono";
import Subscription from "./subscription.model";
import { subscriptionSchema } from "./subscription.schema";
import { HandlerError } from "../../core/handlerError";
import { workflowClient } from "../../core/upstash";
import { SERVER_URL } from "../../core/env";

/**
 * Creates a new subscription for the authenticated user
 * @param c - Hono context object containing request and response
 * @returns JSON response with the created subscription and workflow run ID
 */
export const createSubscription = async (c: Context) => {
  // Get the authenticated user from the context
  const user = c.get("user");
  // Parse the request body
  const body = await c.req.json();

  // Validate the request body against the subscription schema
  const result = subscriptionSchema.safeParse(body);

  // If validation fails, throw an error with the validation issues
  if (!result.success) {
    throw new HandlerError(
      result.error.issues.map((err) => err.message).join(", "),
      400
    );
  }

  // Create a new subscription in the database with the validated data and user ID
  const subscription = await Subscription.create({
    ...result.data,
    user: user._id,
  });

  // Trigger a workflow for subscription reminders
  const { workflowRunId } = await workflowClient.trigger({
    url: `${SERVER_URL}/api/v1/workflows/subscriptions/reminder`,
    body: { subscriptionId: subscription.id },
    headers: {
      "content-type": "application/json",
    },
    retries: 0,
  });

  // Return success response with the created subscription and workflow run ID
  return c.json(
    {
      success: true,
      data: { subscription, workflowRunId },
    },
    201
  );
};

/**
 * Retrieves all subscriptions for a specific user
 * @param c - Hono context object containing request and response
 * @returns JSON response with the user's subscriptions
 */
export const getUserSubscriptions = async (c: Context) => {
  // Get the authenticated user from the context
  const user = c.get("user");
  // Get the user ID from the request parameters
  const userId = c.req.param("id");

  // Check if the authenticated user is the same as the requested user
  if (user._id !== userId) {
    throw new HandlerError("Unauthorized access to subscriptions", 403);
  }

  // Find all subscriptions for the user in the database
  const subscriptions = await Subscription.find({ user: userId });

  // Return success response with the user's subscriptions
  return c.json(
    {
      success: true,
      data: subscriptions,
    },
    200
  );
};
