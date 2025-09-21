import { type Context, type Next } from "hono";
import Subscription from "./subscription.model";
import { subscriptionSchema } from "./subscription.schema";
import { HandlerError } from "../../core/handlerError";

export const createSubscription = async (c: Context) => {
  const user = c.get("user");
  const body = await c.req.json();

  const result = subscriptionSchema.safeParse(body);

  if (!result.success) {
    throw new HandlerError(
      result.error.issues.map((err) => err.message).join(", "),
      400
    );
  }

  const subscription = await Subscription.create({
    ...result.data,
    user: user._id,
  });

  return c.json(
    {
      success: true,
      data: subscription,
    },
    201
  );
};

export const getUserSubscriptions = async (c: Context) => {
  const user = c.get("user");
  const userId = c.req.param("id");

  if (user._id !== userId) {
    throw new HandlerError("Unauthorized access to subscriptions", 403);
  }

  const supscriptions = await Subscription.find({ user: userId });

  return c.json(
    {
      success: true,
      data: supscriptions,
    },
    200
  );
};
