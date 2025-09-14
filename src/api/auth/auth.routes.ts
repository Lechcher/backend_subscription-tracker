import { Hono } from "hono";
import { signIn, signUp, signOut } from "./auth.controller";

const authRoutes = new Hono();

authRoutes.post("/sign-up", signUp);

authRoutes.post("/sign-in", signIn);

authRoutes.post("/sign-out", signOut);

export default authRoutes;
