/**
 * Authentication Middleware
 *
 * This middleware handles JWT-based authentication for protected routes.
 * It validates incoming JWT tokens, verifies user existence, and provides
 * user context to subsequent middleware and route handlers.
 *
 * Authentication Flow:
 * 1. Extract JWT token from Authorization header
 * 2. Verify token signature and expiration
 * 3. Load user details from database
 * 4. Attach user context to request
 *
 * Security Features:
 * - JWT signature verification
 * - Token expiration checking
 * - Password field exclusion
 * - Bearer token scheme enforcement
 *
 * Error Responses:
 * - 401 Unauthorized: Missing or invalid token
 * - 401 Unauthorized: Token verification failure
 * - 401 Unauthorized: User not found
 */

import { type Next, type Context } from "hono";
import { HandlerError } from "../core/handlerError";
import { verify } from "hono/jwt";
import User from "../api/users/user.model";
import { JWT_SECRET, NODE_ENV } from "../core/env";

// Validate JWT secret configuration at startup
// This ensures the authentication system has proper security configuration
if (!JWT_SECRET) {
  throw new HandlerError(
    `JWT_SECRET is not defined, please insert into .env.${NODE_ENV}`,
    401
  );
}

/**
 * Authorization middleware function
 *
 * This middleware protects routes by requiring valid JWT authentication.
 * It extracts and validates the JWT token from the Authorization header,
 * then loads the associated user details for the request context.
 *
 * Usage:
 * ```typescript
 * // Apply to single route
 * app.get("/protected", authorize, handler);
 *
 * // Apply to group of routes
 * const protectedRoutes = new Hono();
 * protectedRoutes.use("*", authorize);
 * ```
 *
 * @param c - Hono context object containing request and response
 * @param next - Next middleware function in the chain
 * @throws {HandlerError} With 401 status if authentication fails
 */
export const authorize = async (c: Context, next: Next) => {
  try {
    let token;

    // Extract and validate Bearer token from Authorization header
    // Format: "Authorization: Bearer <token>"
    if (
      c.req.header("Authorization") &&
      c.req.header("Authorization")?.startsWith("Bearer")
    ) {
      // Split header value and take the token part
      token = c.req.header("Authorization")?.split(" ")[1];
    }

    // Enforce token presence
    if (!token) {
      throw new HandlerError("Unauthorized - No token provided", 401);
    }

    // Verify JWT token signature and expiration
    // This ensures the token is valid and hasn't been tampered with
    const decoded = await verify(token, JWT_SECRET as string);

    // Load user details from database, excluding sensitive data
    // This provides user context for the request while protecting the password
    const user = await User.findById((decoded as any).userId as string).select(
      "-password"
    );

    // Ensure user still exists in the database
    if (!user) {
      throw new HandlerError("Unauthorized - User not found", 401);
    }

    // Attach user context to the request
    // This makes user data available to subsequent middleware and routes
    c.set("user", user);

    // Continue to next middleware or route handler
    await next();
  } catch (error) {
    // Convert all authentication errors to 401 Unauthorized
    // This provides consistent error handling while hiding implementation details
    throw new HandlerError("Unauthorized", 401);
  }
};

export default authorize;
