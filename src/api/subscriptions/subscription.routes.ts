import { Hono } from "hono";
import authorize from "../../middlewares/auth.middleware";
import {
  createSubscription,
  getUserSubscriptions,
} from "./subscription.controller";

const subscriptionRoutes = new Hono();

subscriptionRoutes.use("*", authorize);

subscriptionRoutes.get("/", (c) => {
  return c.json({
    message: "Get All Subscriptions",
  });
});

subscriptionRoutes.get("/:id", (c) => {
  const subscriptionId = c.req.param("id");

  return c.json({
    message: `Get Subscription ${subscriptionId} Details by ID`,
  });
});

subscriptionRoutes.post("/", createSubscription);

subscriptionRoutes.put("/:id", (c) => {
  const subscriptionId = c.req.param;

  return c.json({
    message: `Update ${subscriptionId} Subscription`,
  });
});

subscriptionRoutes.delete("/:id", (c) => {
  const subscriptionId = c.req.param;

  return c.json({
    message: `Delete ${subscriptionId} Subscription`,
  });
});

subscriptionRoutes.get("/user/:id", getUserSubscriptions);

subscriptionRoutes.put("/:id/cancel", (c) => {
  const subscriptionId = c.req.param;

  return c.json({
    message: `Cancel Subscription ${subscriptionId}`,
  });
});

subscriptionRoutes.get("/upcoming-renewals", (c) => {
  return c.json({
    message: "Get Upcoming Renewals",
  });
});

export default subscriptionRoutes;
