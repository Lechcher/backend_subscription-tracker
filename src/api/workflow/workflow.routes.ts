import { Hono } from "hono";
import { sendReminders } from "./workflow.controller";

const workflowRoutes = new Hono();

workflowRoutes.get("/", sendReminders);

workflowRoutes.get("/:id", (c) => {
  const workflowId = c.req.param("id");

  return c.json({
    message: `Get Workflow ${workflowId} Details by ID`,
  });
});

export default workflowRoutes;
