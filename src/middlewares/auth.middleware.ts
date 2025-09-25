import { type Next, type Context } from "hono";
import { HandlerError } from "../core/handlerError";
import { verify } from "hono/jwt";
import User from "../api/users/user.model";
import { JWT_SECRET, NODE_ENV } from "../core/env";

if (!JWT_SECRET) {
  throw new HandlerError(
    `JWT_SECRET is not defined, please insert into .env.${NODE_ENV}`,
    401
  );
}

export const authorize = async (c: Context, next: Next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with "Bearer"
    if (
      c.req.header("Authorization") &&
      c.req.header("Authorization")?.startsWith("Bearer")
    ) {
      // Extract token from the Authorization header
      token = c.req.header("Authorization")?.split(" ")[1];
    }

    // If no token is found, throw an unauthorized error
    if (!token) {
      throw new HandlerError("Unauthorized", 401);
    }

    // Verify the JWT token using the secret key
    const decoded = await verify(token, JWT_SECRET as string);

    // Find the user by ID from the decoded token, excluding the password field
    const user = await User.findById((decoded as any).userId as string).select(
      "-password"
    );

    // Set the user object in the context for use in subsequent middleware/routes
    c.set("user", user);

    // Proceed to the next middleware or route handler
    await next();
  } catch (error) {
    // If any error occurs during authentication, throw an unauthorized error
    throw new HandlerError("Unauthorized", 401);
  }
};

export default authorize;
