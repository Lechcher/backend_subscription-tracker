import { type Context } from "hono";
import mongoose from "mongoose";
import User from "../users/user.model";
import { handlerError } from "../core/handleError";
import { sign } from "hono/jwt";

const JWT_SECRET = Bun.env.JWT_SECRET;
const JWT_EXPIRES_IN = Bun.env.JWT_EXPIRES_IN || "1d";

// Calculate expiration time in seconds since epoch
const expiresInSeconds =
  typeof JWT_EXPIRES_IN === "string" && JWT_EXPIRES_IN.endsWith("d")
    ? Math.floor(Date.now() / 1000) + parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60
    : Math.floor(Date.now() / 1000) + 24 * 60 * 60; // default 1 day

if (!JWT_SECRET) {
  throw new handlerError("JWT_SECRET is not defined", 500);
}

export const signUp = async (c: Context) => {
  const sesseion = await mongoose.startSession();
  sesseion.startTransaction();

  try {
    const { name, email, password } = await c.req.json();

    // Check if user already exists
    const exirstingUser = await User.findOne({ email }).session(sesseion);

    if (exirstingUser) {
      throw new handlerError("User already exists", 409);
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(password);

    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session: sesseion }
    );

    const newUser = newUsers[0];

    const payload = { userId: newUser?._id, exp: expiresInSeconds };
    const token = await sign(payload, JWT_SECRET);

    await sesseion.commitTransaction();
    sesseion.endSession();

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
    await sesseion.abortTransaction();
    throw error;
  } finally {
    sesseion.endSession();
  }
};

export const signIn = async (c: Context) => {
  const { email, password } = await c.req.json();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new handlerError("User not found", 401);
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new handlerError("Invalid password", 401);
    }

    const payload = { userId: user._id, exp: expiresInSeconds };

    const token = await sign(payload, JWT_SECRET);

    return c.json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const signOut = async (c: Context) => {};
