import { type Next, type Context } from "hono";
import { HandlerError } from "../api/core/handlerError";
import { verify } from "hono/jwt";
import User from "../api/users/user.model";
import { JWT_SECRET, NODE_ENV } from "../env";

if (!JWT_SECRET) {
  throw new HandlerError(
    `JWT_SECRET is not defined, please insert into .env.${NODE_ENV}`,
    401
  );
}

export const authorize = async (c: Context, next: Next) => {
  try {
    let token;

    if (
      c.req.header("Authorization") &&
      c.req.header("Authorization")?.startsWith("Bearer")
    ) {
      token = c.req.header("Authorization")?.split(" ")[1];
    }

    if (!token) {
      throw new HandlerError("Unauthorized", 401);
    }

    const decoded = await verify(token, JWT_SECRET as string);

    const user = await User.findById((decoded as any).userId as string).select(
      "-password"
    );

    c.set("user", user);

    await next();
  } catch (error) {
    throw new HandlerError("Unauthorized", 401);
  }
};

export default authorize;
