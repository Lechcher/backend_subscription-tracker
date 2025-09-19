import { Hono } from "hono";
import { getUser, getUsers } from "./user.controller";
import authorize from "../../middlewares/auth.middleware";

const userRoutes = new Hono();

userRoutes.get("/", getUsers);

userRoutes.get("/:id", authorize, getUser);

userRoutes.post("/", (c) => {
  return c.json({
    message: "Create New User",
  });
});

userRoutes.put("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({
    message: `Update User ${id}`,
  });
});

userRoutes.delete("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({
    message: `Delete User ${id}`,
  });
});

export default userRoutes;
