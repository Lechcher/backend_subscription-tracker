import { Hono } from "hono";
import authRoutes from "./api/auth/auth.routes";
import userRoutes from "./api/users/user.routes";
import subscriptionRoutes from "./api/subscriptions/subscription.routes";
import connectToDatabase from "./core/mongodb";
import { registerErrorHandler } from "./middlewares/error.middleware";
import { prettyJSON } from "hono/pretty-json";
import { NODE_ENV, PORT } from "./core/env";
import arcjetMiddleware from "./middlewares/arcjet.middleware";

const app = new Hono();

registerErrorHandler(app);

app.use(prettyJSON());
app.use(arcjetMiddleware);

app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/users", userRoutes);
app.route("/api/v1/subscriptions", subscriptionRoutes);

app.get("/", (c) => {
  return c.text("Welcome to the Subscription Tracker API!");
});

connectToDatabase()
  .then(() => {
    const server = Bun.serve({
      port: PORT,
      fetch: app.fetch,
    });
    console.log(
      `Server is running on "${server.hostname}:${server.port}" in ${NODE_ENV} mode! 🚀`
    );
  })
  .catch((error) => {
    console.error("Error connecting to database: ", error);
    process.exit(1);
  });
