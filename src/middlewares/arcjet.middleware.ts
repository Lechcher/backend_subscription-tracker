import { type Context, type Next } from "hono";
import aj from "../core/arcjet";
import { HandlerError } from "../core/handlerError";

const arcjetMiddleware = async (c: Context, next: Next) => {
  try {
    // Protect the request using Arcjet with a limit of 1 request
    const decision = await aj.protect(c.req.raw, { requested: 1 });

    // Check if the request is denied
    if (decision.isDenied()) {
      // Handle rate limit denial
      if (decision.reason.isRateLimit()) {
        throw new HandlerError("Too many requests - Rate limit exceeded", 429);
      }

      // Handle bot detection denial
      if (decision.reason.isBot()) {
        throw new HandlerError("Access denied - Bot detected", 403);
      }

      // Handle other types of denials
      throw new HandlerError("Access denied", 403);
    }

    // If request is allowed, proceed to the next middleware
    await next();
  } catch (error) {
    // Log any errors that occur during the middleware execution
    console.error("Arcjet Middleware Error:", error);
    throw error;
  }
};

export default arcjetMiddleware;
