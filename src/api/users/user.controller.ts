/**
 * User Management Controller
 *
 * This controller handles all user-related operations including
 * retrieving user information and managing user profiles.
 * It provides endpoints for fetching individual users and all users
 * with appropriate data filtering and security measures.
 *
 * Features:
 * - User data retrieval with password exclusion for security
 * - Error handling with consistent response format
 * - Database query optimization
 * - Input validation through parameter extraction
 *
 * Endpoints:
 * - GET /api/v1/users - Get all users
 * - GET /api/v1/users/:id - Get specific user by ID
 */

import { type Context } from "hono";
import User from "./user.model";
import { HandlerError } from "../../core/handlerError";

/**
 * Retrieves all users from the database
 *
 * This endpoint fetches all user records from the database without
 * any filtering. It's typically used for administrative purposes
 * or user management dashboards.
 *
 * @param c - Hono context object containing request and response
 * @returns JSON response with all users
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "user_id",
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "createdAt": "2023-01-01T00:00:00.000Z",
 *       "updatedAt": "2023-01-01T00:00:00.000Z"
 *     }
 *   ]
 * }
 */
export const getUsers = async (c: Context) => {
  try {
    // Fetch all users from the database
    // This query returns all user documents without any filtering
    const users = await User.find();

    // Return success response with all users
    return c.json(
      {
        success: true,
        data: users,
      },
      200
    );
  } catch (error) {
    // Re-throw the error to be handled by the global error handler
    // This ensures consistent error response format across the application
    throw error;
  }
};

/**
 * Retrieves a specific user by ID from the database
 *
 * This endpoint fetches a single user record based on the ID
 * provided in the URL parameters. It excludes the password field
 * for security reasons, as this endpoint may be used for profile
 * display or user information retrieval.
 *
 * @param c - Hono context object containing request and response
 * @returns JSON response with the requested user (excluding password)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "user_id",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "createdAt": "2023-01-01T00:00:00.000Z",
 *     "updatedAt": "2023-01-01T00:00:00.000Z"
 *   }
 * }
 *
 * Error Responses:
 * - 404: User not found
 * - 500: Internal server error
 */
export const getUser = async (c: Context) => {
  try {
    // Extract user ID from request parameters
    const userId = c.req.param("id");

    // Fetch user by ID from the database, excluding the password field for security
    // The select("-password") method ensures sensitive data is not exposed
    const user = await User.findById(userId).select("-password");

    // Check if user exists (findById returns null if not found)
    if (!user) {
      throw new HandlerError("User not found", 404);
    }

    // Return success response with the user data
    return c.json(
      {
        success: true,
        data: user,
      },
      200
    );
  } catch (error) {
    // Re-throw the error to be handled by the global error handler
    // This ensures consistent error response format across the application
    throw error;
  }
};
