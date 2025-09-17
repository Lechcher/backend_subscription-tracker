import { Hono } from "hono";
import { signIn, signUp, signOut } from "./auth.controller";

// Create a new Hono instance for authentication routes
const authRoutes = new Hono();

// Define the sign-up route that handles POST requests to /sign-up
// This route will call the signUp controller function
authRoutes.post("/sign-up", signUp);

// Define the sign-in route that handles POST requests to /sign-in
// This route will call the signIn controller function
authRoutes.post("/sign-in", signIn);

// Define the sign-out route that handles POST requests to /sign-out
// This route will call the signOut controller function
authRoutes.post("/sign-out", signOut);

// Export the authRoutes to be used in the main application
export default authRoutes;
