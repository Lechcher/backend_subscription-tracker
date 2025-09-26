/**
 * Main Application Entry Point
 *
 * This file serves as the entry point for the Subscription Tracker API server.
 * It sets up the Hono application framework, configures middleware,
 * defines API routes, and starts the server with database connection.
 *
 * Key responsibilities:
 * - Initialize Hono application instance
 * - Register global error handler
 * - Configure middleware (JSON formatting, security)
 * - Define API route structure
 * - Establish database connection
 * - Start the HTTP server
 */

import { Hono } from "hono";
import authRoutes from "./api/auth/auth.routes";
import userRoutes from "./api/users/user.routes";
import subscriptionRoutes from "./api/subscriptions/subscription.routes";
import connectToDatabase from "./core/mongodb";
import { registerErrorHandler } from "./middlewares/error.middleware";
import { prettyJSON } from "hono/pretty-json";
import { NODE_ENV, PORT } from "./core/env";
import arcjetMiddleware from "./middlewares/arcjet.middleware";
import workflowRoutes from "./api/workflow/workflow.routes";

// Initialize Hono application instance
// Hono is a lightweight, fast web framework for building APIs
const app = new Hono();

// Register global error handler middleware
// This catches all unhandled errors and provides consistent error responses
registerErrorHandler(app);

// Enable pretty JSON formatting for development environments
// Makes API responses more readable during development
app.use(prettyJSON());

// Apply Arcjet security middleware for bot detection and rate limiting
// Protects the API from automated attacks and abuse
app.use(arcjetMiddleware);

// Configure API routes with versioning
// All API endpoints are prefixed with /api/v1 for version control

// Authentication routes - handle user registration, login, and JWT management
app.route("/api/v1/auth", authRoutes);

// User management routes - handle user profile and account operations
app.route("/api/v1/users", userRoutes);

// Subscription management routes - handle CRUD operations for subscriptions
app.route("/api/v1/subscriptions", subscriptionRoutes);

// Workflow automation routes - handle background tasks and email notifications
app.route("/api/v1/workflows", workflowRoutes);

// Health check endpoint - provides basic API status information
app.get("/", (c) => {
  return c.text("Welcome to the Subscription Tracker API!");
});

// Connect to MongoDB database and start the server
// This ensures the database connection is established before starting the server
connectToDatabase()
  .then(() => {
    // Start the HTTP server using Bun's built-in server
    // Bun provides high-performance HTTP server capabilities
    const server = Bun.serve({
      port: PORT,
      fetch: app.fetch,
    });

    // Log server startup information
    console.log(
      `Server is running on "${server.hostname}:${server.port}" in ${NODE_ENV} mode! 🚀`
    );
  })
  .catch((error) => {
    // Handle database connection errors
    console.error("Error connecting to database: ", error);
    process.exit(1); // Exit the process if database connection fails
  });
