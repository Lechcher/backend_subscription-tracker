/**
 * Error Handling Middleware for Subscription Tracker Backend
 *
 * This middleware provides centralized error handling for the Hono-based backend application.
 * It intercepts errors from any route or middleware that throws them, categorizes them by type,
 * and returns standardized error responses with appropriate HTTP status codes.
 *
 * Features:
 * - Global error interception using Hono's onError hook
 * - Automatic error type detection and categorization
 * - Consistent error response format across all error types
 * - Support for MongoDB/Mongoose validation errors
 * - Support for Zod schema validation errors
 * - Support for duplicate key errors
 * - Support for cast errors
 * - Development-friendly error logging
 */
import { Hono } from "hono";
import mongoose from "mongoose";
import { ZodError } from "zod";

/**
 * Registers the global error handling middleware with the Hono application
 *
 * @param app - The Hono application instance to register the error handler with
 *
 * This function sets up a global error handler that will catch all errors
 * thrown anywhere in the application stack, including route handlers,
 * other middleware, and async operations.
 */
export const registerErrorHandler = (app: Hono) => {
  // Register global error handler using Hono's onError middleware
  // This handler will be called whenever an error is thrown in the application
  app.onError((err, c) => {
    // Log the error to the console for debugging purposes
    // In production, you might want to use a proper logging service
    console.error(err);

    // Initialize default error response values
    // 500 Internal Server Error is the default for unhandled errors
    let statusCode = 500;
    let message = "Server Error";

    // Handle MongoDB/Mongoose CastError
    // This occurs when trying to cast a value to a specific type that fails
    // Common examples: invalid ObjectId format, type conversion failures
    if (err instanceof mongoose.Error.CastError) {
      message = "Resource not found";
      statusCode = 404;
    }

    // Handle MongoDB duplicate key error
    // Error code 11000 is thrown when a unique constraint is violated
    // This typically happens when trying to insert a duplicate document
    if ("code" in err && err.code === 11000) {
      message = "Duplicate field value entered";
      statusCode = 400; // Bad Request
    }

    // Handle MongoDB/Mongoose ValidationError
    // This occurs when document validation fails according to the schema
    // Aggregates all validation error messages into a single comma-separated string
    if (err instanceof mongoose.Error.ValidationError) {
      message = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
      statusCode = 400; // Bad Request
    }

    // Handle Zod validation errors
    // Zod is used for runtime schema validation in route handlers
    // Formats validation errors to show the field path and specific error message
    if (err instanceof ZodError) {
      message = err.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      statusCode = 400; // Bad Request
    }

    // Set the HTTP status code for the response
    // The 'as any' type assertion is used because Hono's type system
    // may not recognize all numeric status codes, but they are valid HTTP codes
    c.status(statusCode as any);

    // Return standardized JSON error response
    // This ensures consistent error format across all error types
    return c.json({
      success: false,
      error: message,
    });
  });
};
