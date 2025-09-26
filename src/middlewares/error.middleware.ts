/**
 * Global Error Handler Middleware
 *
 * This module provides centralized error handling for the entire application.
 * It catches all errors thrown during request processing and formats them
 * into consistent error responses. The handler supports various error types
 * including:
 *
 * - Custom HandlerError for application-specific errors
 * - MongoDB errors (CastError, ValidationError, etc.)
 * - Zod validation errors from request parsing
 * - Generic unhandled exceptions
 *
 * Error Response Format:
 * {
 *   "success": false,
 *   "error": "Human-readable error message"
 * }
 *
 * HTTP Status Codes:
 * - 400: Bad Request (validation errors, malformed input)
 * - 401: Unauthorized (authentication required)
 * - 403: Forbidden (insufficient permissions)
 * - 404: Not Found (resource doesn't exist)
 * - 409: Conflict (duplicate data)
 * - 500: Internal Server Error (unhandled exceptions)
 */

import { Hono } from "hono";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { HandlerError } from "../core/handlerError";

/**
 * Registers the global error handler middleware with a Hono application
 *
 * @param app - The Hono application instance
 *
 * The handler processes errors in the following order:
 * 1. Custom HandlerError (used directly)
 * 2. MongoDB CastError (invalid IDs)
 * 3. MongoDB Duplicate Key Error (unique constraints)
 * 4. MongoDB Validation Error (schema validation)
 * 5. Zod Validation Error (request body validation)
 * 6. Generic Error (fallback case)
 */
export const registerErrorHandler = (app: Hono) => {
  // Register error handler middleware to catch all errors
  app.onError((err, c) => {
    // Log the error for debugging and monitoring
    // In production, this should use proper logging infrastructure
    console.error(err);

    // If the error is our custom HandlerError, use it directly
    // This allows for precise error control in the application code
    if (err instanceof HandlerError) {
      return c.json(
        {
          success: false,
          error: err.message,
        },
        // Cast to any to satisfy Hono's TypeScript overload
        err.statusCode as any
      );
    }

    // Create a default error for unhandled cases
    // This ensures a consistent error response format
    const error = new HandlerError("Internal Server Error", 500);

    // Handle MongoDB CastError (usually from invalid ObjectId format)
    // This commonly occurs when an invalid ID is provided in URL parameters
    if (err instanceof mongoose.Error.CastError) {
      error.message = "Resource not found";
      error.statusCode = 404;
    }

    // Handle MongoDB duplicate key errors (unique constraint violations)
    // This occurs when trying to insert duplicate values in unique fields
    if (
      typeof (err as any).code !== "undefined" &&
      (err as any).code === 11000
    ) {
      error.message = "Duplicate field value entered";
      error.statusCode = 400; // Bad Request
    }

    // Handle MongoDB validation errors (schema validation failures)
    // These errors occur when document data doesn't match schema rules
    if (err instanceof mongoose.Error.ValidationError) {
      error.message = Object.values(err.errors)
        .map((val: any) => val.message)
        .join(", ");
      error.statusCode = 400; // Bad Request
    }

    // Handle Zod validation errors (from request body validation)
    if (err instanceof ZodError) {
      error.message = err.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      error.statusCode = 400; // Bad Request
    }

    // Return standardized error response
    return c.json(
      {
        success: false,
        error: error.message,
      },
      // cast to any to satisfy Hono's TypeScript overload
      error.statusCode as any
    );
  });
};
