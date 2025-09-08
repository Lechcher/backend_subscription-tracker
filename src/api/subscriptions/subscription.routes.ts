import { Hono } from 'hono';

const subscriptionRoutes = new Hono();

subscriptionRoutes.get("/", (c) => {
    return c.json({
        message: 'Get All Subscriptions',
    })
});

subscriptionRoutes.get("/:id", (c) => {
    const subscriptionId = c.req.param("id");

    return c.json({
      message: `Get Subscription ${subscriptionId} Details by ID`,
    });
});

subscriptionRoutes.post("/", (c) => {
    return c.json({
      message: "Create New Subscription",
    });
});

subscriptionRoutes.put("/:id", (c) => {
    const subscriptionId = c.req.param;

    return c.json({
        message: `Update ${subscriptionId} Subscription`
    })
});

subscriptionRoutes.delete("/:id", (c) => {
  const subscriptionId = c.req.param;

  return c.json({
    message: `Delete ${subscriptionId} Subscription`,
  });
});

subscriptionRoutes.get("/user/:id", (c) => {
  const userId = c.req.param("id");

  return c.json({
    message: `Get All Subscription from User ${userId}`,
  });
});

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