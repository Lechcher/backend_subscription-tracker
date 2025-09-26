/**
 * Authentication Controller
 *
 * This controller handles all authentication-related operations including
 * user registration, login, and logout. It implements secure password
 * hashing, JWT token generation, and database transactions for data integrity.
 *
 * Features:
 * - User registration with password hashing
 * - JWT-based authentication
 * - Database transactions for data consistency
 * - Password verification using Bun's secure hashing
 * - Environment-based configuration
 *
 * Endpoints:
 * - POST /api/v1/auth/signup - User registration
 * - POST /api/v1/auth/signin - User login
 * - POST /api/v1/auth/signout - User logout (placeholder)
 */

import { type Context } from "hono";
import mongoose from "mongoose";
import User from "../users/user.model";
import { HandlerError } from "../../core/handlerError";
import { sign } from "hono/jwt";
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from "../../core/env";

// Validate JWT secret configuration
// This ensures the application has proper security configuration
if (!JWT_SECRET) {
  throw new HandlerError(
    `JWT_SECRET is not defined, please insert into .env or .env.${NODE_ENV}.local`,
    500
  );
}

// Calculate JWT expiration time in seconds since epoch
// Supports configuration with 'd' suffix for days (e.g., "7d" for 7 days)
// Defaults to 1 day if no configuration is provided
const expiresInSeconds =
  typeof JWT_EXPIRES_IN === "string" && JWT_EXPIRES_IN.endsWith("d")
    ? Math.floor(Date.now() / 1000) + parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60
    : Math.floor(Date.now() / 1000) + 24 * 60 * 60; // default 1 day

/**
 * User Registration (Sign Up)
 *
 * Creates a new user account with the following process:
 * 1. Extract user data from request body
 * 2. Check if user already exists
 * 3. Hash password using Bun's secure password hashing
 * 4. Create user within database transaction
 * 5. Generate JWT token for immediate authentication
 * 6. Return success response with user data and token
 *
 * @param c - Hono context object containing request and response
 * @returns JSON response with success status, message, token, and user data
 *
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "securePassword123"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "data": {
 *     "token": "jwt_token_here",
 *     "user": { "_id": "user_id", "name": "John Doe", "email": "john@example.com" }
 *   }
 * }
 */
export const signUp = async (c: Context) => {
  // Start MongoDB session for transaction to ensure data consistency
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Extract user data from request body
    const { name, email, password } = await c.req.json();

    // Check if user already exists to prevent duplicate accounts
    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      throw new HandlerError("User already exists", 409);
    }

    // Hash password using Bun's built-in password hashing for security
    const hashedPassword = await Bun.password.hash(password);

    // Create new user within transaction to ensure atomicity
    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session: session }
    );

    const newUser = newUsers[0];

    // Create JWT payload with user ID and expiration time
    const payload = { userId: newUser?._id, exp: expiresInSeconds };

    const token = await sign(payload, JWT_SECRET as string);

    // Commit transaction and end session to persist changes
    await session.commitTransaction();
    session.endSession();

    // Return success response with token and user data
    return c.json(
      {
        success: true,
        message: "User registered successfully",
        data: {
          token,
          user: newUser,
        },
      },
      201
    );
  } catch (error) {
    // Abort transaction if error occurs to maintain data consistency
    await session.abortTransaction();
    throw error;
  } finally {
    // Ensure session is ended to prevent resource leaks
    session.endSession();
  }
};

/**
 * User Login (Sign In)
 *
 * Authenticates a user and returns a JWT token for session management:
 * 1. Extract email and password from request body
 * 2. Find user by email address
 * 3. Verify password using secure hashing comparison
 * 4. Generate JWT token for authenticated session
 * 5. Return success response with user data and token
 *
 * @param c - Hono context object containing request and response
 * @returns JSON response with success status, message, token, and user data
 *
 * Request Body:
 * {
 *   "email": "john@example.com",
 *   "password": "securePassword123"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "User signed in successfully",
 *   "data": {
 *     "token": "jwt_token_here",
 *     "user": { "_id": "user_id", "name": "John Doe", "email": "john@example.com" }
 *   }
 * }
 */
export const signIn = async (c: Context) => {
  // Extract email and password from request body
  const { email, password } = await c.req.json();

  try {
    // Find user by email address
    const user = await User.findOne({ email });

    if (!user) {
      throw new HandlerError("User not found", 404);
    }

    // Verify password using Bun's secure password verification
    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new HandlerError("Invalid password", 401);
    }

    // Create JWT payload with user ID and expiration time
    const payload = { userId: user._id, exp: expiresInSeconds };

    // Generate JWT token for authenticated session
    const token = await sign(payload, JWT_SECRET as string);

    // Return success response with token and user data
    return c.json(
      {
        success: true,
        message: "User signed in successfully",
        data: {
          token,
          user,
        },
      },
      200
    );
  } catch (error) {
    throw error;
  }
};

/**
 * User Logout (Sign Out)
 *
 * Placeholder function for user logout functionality.
 * In a production environment, this would typically:
 * - Invalidate the JWT token (add to blacklist)
 * - Clear client-side authentication tokens
 * - Log the logout event for security auditing
 *
 * @param c - Hono context object containing request and response
 * @returns Empty response (placeholder implementation)
 */
export const signOut = async (c: Context) => {};
