/**
 * Custom Error Handler Class
 *
 * This class extends the built-in Error class to provide structured error handling
 * throughout the application. It allows for consistent error responses with
 * appropriate HTTP status codes and error messages.
 *
 * Features:
 * - Extends native Error class for proper error handling
 * - Supports custom HTTP status codes
 * - Maintains proper TypeScript prototype chain
 * - Provides consistent error structure for API responses
 *
 * Usage:
 * throw new HandlerError("User not found", 404);
 *
 * The error can then be caught by the global error middleware and
 * returned as a structured JSON response with the appropriate status code.
 */
export class HandlerError extends Error {
  public statusCode: number;

  /**
   * Creates a new HandlerError instance
   * @param message - Error message describing what went wrong
   * @param statusCode - HTTP status code (default: 500 for Internal Server Error)
   */
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HandlerError";

    // Fix prototype chain for Error subclassing in TypeScript
    // This ensures proper instanceof checks and error handling
    Object.setPrototypeOf(this, HandlerError.prototype);
  }
}
