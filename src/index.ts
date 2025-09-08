import { Hono } from "hono";
import authRoutes from "./api/auth/auth.routes";
import userRoutes from "./api/users/user.routes";
import subscriptionRoutes from "./api/subscriptions/subscription.routes";
import connectToDatabase from "./api/core/mongodb";
import { registerErrorHandler } from "./middlewares/error.middleware";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();
const port = Bun.env.PORT || 3000;

registerErrorHandler(app);

app.use(prettyJSON());

app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/users", userRoutes);
app.route("/api/v1/subscriptions", subscriptionRoutes);

app.get("/", (c) => {
  return c.text("Welcome to the Subscription Tracker API!");
});

connectToDatabase()
  .then(() => {
    const server = Bun.serve({
      port: port,
      fetch: app.fetch,
    });
    console.log(
      `Server is running on "${server.hostname}:${server.port}" in ${Bun.env.NODE_ENV} mode! 🚀`
    );
  })
  .catch((error) => {
    console.error("Error connecting to database: ", error);
    process.exit(1);
  });
