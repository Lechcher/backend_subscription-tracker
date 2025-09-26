/**
 * Authentication Routes
 *
 * This module defines all authentication-related routes for the application.
 * It creates a separate router instance for authentication endpoints to maintain
 * clean separation of concerns and modular route management.
 *
 * Base Path: /api/v1/auth
 *
 * Available Routes:
 * - POST /sign-up - User registration endpoint
 * - POST /sign-in - User login endpoint
 * - POST /sign-out - User logout endpoint
 *
 * Security:
 * - All routes validate input through Zod schemas
 * - JWT tokens are used for session management
 * - Rate limiting is applied through Arcjet middleware
 *
 * Error Handling:
 * - All routes use the global error handler
 * - Authentication errors return appropriate HTTP status codes
 * - Input validation errors return detailed error messages
 */

import { Hono } from "hono";
import { signIn, signUp, signOut } from "./auth.controller";

// Create a new Hono instance for authentication routes
// This creates an isolated router for authentication endpoints
const authRoutes = new Hono();

/**
 * User Registration Route
 * POST /api/v1/auth/sign-up
 *
 * Handles new user registration with the following process:
 * 1. Validates user input (name, email, password)
 * 2. Checks for existing users with the same email
 * 3. Creates new user record with hashed password
 * 4. Generates and returns JWT token
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "email": "string",
 *   "password": "string"
 * }
 */
authRoutes.post("/sign-up", signUp);

/**
 * User Login Route
 * POST /api/v1/auth/sign-in
 *
 * Authenticates existing users and creates a new session:
 * 1. Validates login credentials
 * 2. Verifies password hash
 * 3. Generates and returns new JWT token
 *
 * Request Body:
 * {
 *   "email": "string",
 *   "password": "string"
 * }
 */
authRoutes.post("/sign-in", signIn);

/**
 * User Logout Route
 * POST /api/v1/auth/sign-out
 *
 * Handles user session termination:
 * 1. Invalidates current JWT token (planned feature)
 * 2. Clears user session data
 * 3. Returns success response
 *
 * Note: Currently a placeholder for future token invalidation
 */
authRoutes.post("/sign-out", signOut);

// Export the authentication routes for use in the main application
export default authRoutes;
