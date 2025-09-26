/**
 * Subscription Management Controller
 *
 * This controller handles all subscription-related operations including
 * creating, retrieving, and managing user subscriptions. It implements
 * data validation, user authentication, and workflow automation for
 * subscription reminders and notifications.
 *
 * Features:
 * - Zod schema validation for subscription data
 * - User authentication and authorization
 * - Database transaction management
 * - Workflow automation for subscription reminders
 * - Error handling with consistent response format
 *
 * Endpoints:
 * - POST /api/v1/subscriptions - Create new subscription
 * - GET /api/v1/subscriptions/users/:id - Get user's subscriptions
 */

import { type Context } from "hono";
import Subscription from "./subscription.model";
import { subscriptionSchema } from "./subscription.schema";
import { HandlerError } from "../../core/handlerError";
import { workflowClient } from "../../core/upstash";
import { SERVER_URL } from "../../core/env";

/**
 * Creates a new subscription for the authenticated user
 *
 * This endpoint allows authenticated users to create new subscriptions
 * with the following process:
 * 1. Extract authenticated user from context
 * 2. Parse and validate request body against subscription schema
 * 3. Create subscription record in database with user association
 * 4. Trigger background workflow for renewal reminders
 * 5. Return created subscription with workflow information
 *
 * @param c - Hono context object containing request and response
 * @returns JSON response with the created subscription and workflow run ID
 *
 * Request Body:
 * {
 *   "name": "Netflix Premium",
 *   "price": 15.99,
 *   "currency": "USD",
 *   "frequency": "monthly",
 *   "category": "entertainment",
 *   "paymentMethod": "credit_card"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "subscription": { "_id": "sub_id", "name": "Netflix Premium", ... },
 *     "workflowRunId": "workflow_run_id"
 *   }
 * }
 *
 * Error Responses:
 * - 400: Validation errors in request body
 * - 401: Authentication required
 * - 500: Internal server error
 */
export const createSubscription = async (c: Context) => {
  // Get the authenticated user from the context (set by auth middleware)
  const user = c.get("user");

  // Parse the request body from JSON
  const body = await c.req.json();

  // Create a partial schema that excludes fields handled by the model/middleware
  // This ensures only user-provided data is validated, while system-generated
  // fields (startDate, renewalDate, user) are handled automatically
  const partialSchema = subscriptionSchema.omit({
    startDate: true,
    renewalDate: true,
    user: true,
  });

  // Validate the request body against the partial schema
  const result = partialSchema.safeParse(body);

  // If validation fails, throw an error with the validation issues
  if (!result.success) {
    throw new HandlerError(
      result.error.issues
        .map((err) => `${err.path.join(" ")} - ${err.message}`)
        .join("\n")
    );
  }

  // Create a new subscription in the database with the validated data and user ID
  // The user ID is automatically associated with the subscription
  const subscription = await Subscription.create({
    ...result.data,
    user: user._id,
  });

  // Trigger a workflow for subscription reminders
  // This sets up automated renewal notifications and background processing
  const { workflowRunId } = await workflowClient.trigger({
    url: `${SERVER_URL}/api/v1/workflows/subscriptions/reminder`,
    body: { subscriptionId: subscription.id },
    headers: {
      "content-type": "application/json",
    },
    retries: 0, // No retries for this workflow (can be adjusted based on requirements)
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
 *
 * This endpoint fetches all subscription records associated with a user.
 * It includes authorization checks to ensure users can only access their
 * own subscription data. The endpoint returns comprehensive subscription
 * information including renewal dates and payment details.
 *
 * @param c - Hono context object containing request and response
 * @returns JSON response with the user's subscriptions
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "sub_id",
 *       "name": "Netflix Premium",
 *       "price": 15.99,
 *       "currency": "USD",
 *       "frequency": "monthly",
 *       "category": "entertainment",
 *       "paymentMethod": "credit_card",
 *       "startDate": "2023-01-01T00:00:00.000Z",
 *       "renewalDate": "2023-02-01T00:00:00.000Z",
 *       "user": "user_id",
 *       "createdAt": "2023-01-01T00:00:00.000Z",
 *       "updatedAt": "2023-01-01T00:00:00.000Z"
 *     }
 *   ]
 * }
 *
 * Error Responses:
 * - 403: Unauthorized access to another user's subscriptions
 * - 404: User not found
 * - 500: Internal server error
 */
export const getUserSubscriptions = async (c: Context) => {
  // Get the authenticated user from the context (set by auth middleware)
  const user = c.get("user");

  // Get the user ID from the request parameters
  const userId = c.req.param("id");

  // Check if the authenticated user is the same as the requested user
  // This ensures users can only access their own subscription data
  if (user._id !== userId) {
    throw new HandlerError("Unauthorized access to subscriptions", 403);
  }

  // Find all subscriptions for the user in the database
  // This query returns all subscription documents associated with the user
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
