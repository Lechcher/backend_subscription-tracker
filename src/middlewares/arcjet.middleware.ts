import { type Context, type Next } from "hono";
import aj from "../core/arcjet";
import { HandlerError } from "../core/handlerError";

const arcjetMiddleware = async (c: Context, next: Next) => {
  try {
    const decision = await aj.protect(c.req.raw, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HandlerError("Too many requests - Rate limit exceeded", 429);
      }

      if (decision.reason.isBot()) {
        throw new HandlerError("Access denied - Bot detected", 403);
      }

      throw new HandlerError("Access denied", 403);
    }

    await next();
  } catch (error) {
    console.error("Arcjet Middleware Error:", error);
    throw error;
  }
};

export default arcjetMiddleware;
