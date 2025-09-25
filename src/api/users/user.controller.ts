import { type Context } from "hono";
import User from "./user.model";

/**
 * Retrieves all users from the database
 * @param c - Hono context object containing request and response
 * @returns JSON response with all users
 */
export const getUsers = async (c: Context) => {
  try {
    // Fetch all users from the database
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
    throw error;
  }
};

/**
 * Retrieves a specific user by ID from the database
 * @param c - Hono context object containing request and response
 * @returns JSON response with the requested user (excluding password)
 */
export const getUser = async (c: Context) => {
  try {
    // Fetch user by ID from the database, excluding the password field
    const user = await User.findById(c.req.param("id")).select("-password");

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
    throw error;
  }
};
