/**
 * Upstash Workflow Client Configuration
 *
 * This file configures the Upstash QStash workflow client for managing
 * background tasks, message queuing, and asynchronous processing.
 *
 * Features:
 * - Background task scheduling and execution
 * - Message queuing for reliable delivery
 * - Asynchronous workflow management
 * - Integration with subscription renewal processes
 *
 * Usage:
 * import { workflowClient } from './upstash';
 *
 * Example:
 * await workflowClient.trigger({
 *   url: '/api/v1/workflows/renewal-reminder',
 *   body: { subscriptionId: '123' }
 * });
 */

import { Client as WorkflowClient } from "@upstash/workflow";
import { QSTASH_URL, QSTASH_TOKEN } from "./env";

// Initialize Upstash Workflow client with configuration
// This client handles background tasks and message queuing
export const workflowClient = new WorkflowClient({
  baseUrl: QSTASH_URL, // Base URL for Upstash QStash service
  token: QSTASH_TOKEN, // Authentication token for API access
});
