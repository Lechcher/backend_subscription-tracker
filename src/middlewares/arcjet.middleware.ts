/**
 * Arcjet Security Middleware
 *
 * This middleware implements advanced security features using Arcjet's protection
 * system. It provides multiple layers of security including:
 *
 * - Rate limiting: Prevents abuse by limiting request frequency
 * - Bot detection: Identifies and blocks malicious automated traffic
 * - DDoS protection: Shields against distributed denial of service attacks
 * - Request validation: Ensures requests meet security requirements
 *
 * Error Responses:
 * - 429 Too Many Requests: Rate limit exceeded
 * - 403 Forbidden: Bot detected or other security violation
 * - 500 Internal Server Error: Middleware execution failure
 *
 * Headers Set:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Remaining requests in current window
 * - X-RateLimit-Reset: Time until limit resets (in seconds)
 */

import { type Context, type Next } from "hono";
import aj from "../core/arcjet";
import { HandlerError } from "../core/handlerError";

/**
 * Arcjet security middleware function
 *
 * This middleware wraps each request in Arcjet's protection system,
 * applying configured security rules and rate limits. It intercepts
 * the request before it reaches the route handlers and performs
 * security checks.
 *
 * Security Features:
 * 1. Rate limiting based on IP address and configured rules
 * 2. Bot detection with allowlist for legitimate bots
 * 3. DDoS protection through request throttling
 * 4. Request validation against security rules
 *
 * @param c - Hono context object containing request and response
 * @param next - Next middleware function in the chain
 * @throws {HandlerError} With appropriate status code and message if request is denied
 */
const arcjetMiddleware = async (c: Context, next: Next) => {
  try {
    // Protect the request using Arcjet's security system
    // The 'requested: 1' parameter indicates this is a single request to be evaluated
    const decision = await aj.protect(c.req.raw, { requested: 1 });

    // Check if the request should be denied based on security rules
    if (decision.isDenied()) {
      // Handle rate limit violations (too many requests)
      // This occurs when a client exceeds their allowed request quota
      if (decision.reason.isRateLimit()) {
        throw new HandlerError("Too many requests - Rate limit exceeded", 429);
      }

      // Handle bot detection (unauthorized automated traffic)
      // This occurs when a request is identified as coming from a bot
      // that isn't on the allowlist (e.g., not a search engine)
      if (decision.reason.isBot()) {
        throw new HandlerError("Access denied - Bot detected", 403);
      }

      // Handle other security violations (catch-all)
      // This could include DDoS protection triggers or other security rules
      throw new HandlerError("Access denied", 403);
    }

    // If the request passes all security checks, proceed to the next middleware
    await next();
  } catch (error) {
    // Log any errors that occur during security checking
    // This helps with debugging and security monitoring
    console.error("Arcjet Middleware Error:", error);

    // Re-throw the error to be handled by the global error handler
    throw error;
  }
};

export default arcjetMiddleware;
