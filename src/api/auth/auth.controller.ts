import { type Context } from "hono";
import mongoose from "mongoose";
import User from "../users/user.model";
import { HandlerError } from "../core/handlerError";
import { sign } from "hono/jwt";
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from "../../env";

if (!JWT_SECRET) {
  throw new HandlerError(
    `JWT_SECRET is not defined, please insert into .env or .env.${NODE_ENV}.local`,
    500
  );
}

// Calculate expiration time in seconds since epoch
const expiresInSeconds =
  typeof JWT_EXPIRES_IN === "string" && JWT_EXPIRES_IN.endsWith("d")
    ? Math.floor(Date.now() / 1000) + parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60
    : Math.floor(Date.now() / 1000) + 24 * 60 * 60; // default 1 day

/**
 * Handles user registration (sign up)
 * @param c - Hono context object containing request and response
 * @returns JSON response with success status, message, token, and user data
 */
export const signUp = async (c: Context) => {
  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Extract user data from request body
    const { name, email, password } = await c.req.json();

    // Check if user already exists
    const exirstingUser = await User.findOne({ email }).session(session);

    if (exirstingUser) {
      throw new HandlerError("User already exists", 409);
    }

    // Hash password using Bun's built-in password hashing
    const hashedPassword = await Bun.password.hash(password);

    // Create new user within transaction
    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session: session }
    );

    const newUser = newUsers[0];

    // Create JWT payload with user ID and expiration time
    const payload = { userId: newUser?._id, exp: expiresInSeconds };

    const token = await sign(payload, JWT_SECRET as string);

    // Commit transaction and end session
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
    // Abort transaction if error occurs
    await session.abortTransaction();
    throw error;
  } finally {
    // Ensure session is ended
    session.endSession();
  }
};

/**
 * Handles user login (sign in)
 * @param c - Hono context object containing request and response
 * @returns JSON response with success status, message, token, and user data
 */
export const signIn = async (c: Context) => {
  // Extract email and password from request body
  const { email, password } = await c.req.json();

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new HandlerError("User not found", 404);
    }

    // Verify password
    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new HandlerError("Invalid password", 401);
    }

    // Create JWT payload with user ID and expiration time
    const payload = { userId: user._id, exp: expiresInSeconds };

    // Generate JWT token
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
 * Handles user logout (sign out)
 * Currently empty - implementation would typically involve invalidating the token
 * @param c - Hono context object containing request and response
 */
export const signOut = async (c: Context) => {};
