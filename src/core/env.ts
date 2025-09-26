/**
 * Environment Variables Configuration
 *
 * This file exports all environment variables used by the application.
 * It uses Bun's built-in environment variable system to provide type-safe
 * access to configuration values.
 *
 * Environment Variables:
 * - NODE_ENV: Application environment (development, production, test)
 * - PORT: Server port number for HTTP connections
 * - SERVER_URL: Base URL for the application (used for email links and redirects)
 * - MONGODB_URI: MongoDB connection string for database access
 * - JWT_SECRET: Secret key for JSON Web Token signing and verification
 * - JWT_EXPIRES_IN: Token expiration time (supports 'd' suffix for days)
 * - ARCJET_KEY: API key for Arcjet security service
 * - ARCJET_ENV: Arcjet environment configuration
 * - QSTASH_URL: Upstash QStash service URL for message queuing
 * - QSTASH_TOKEN: Authentication token for Upstash QStash service
 * - QSTASH_CURRENT_SIGNING_KEY: Current signing key for QStash message verification
 * - QSTASH_NEXT_SIGNING_KEY: Next signing key for QStash key rotation
 * - RESEND_API_KEY: API key for Resend email service
 *
 * Usage:
 * import { NODE_ENV, PORT } from './core/env';
 *
 * Note: All variables are typed and provided by Bun.env
 */

export const {
  NODE_ENV,
  PORT,
  SERVER_URL,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ARCJET_KEY,
  ARCJET_ENV,
  QSTASH_URL,
  QSTASH_TOKEN,
  QSTASH_CURRENT_SIGNING_KEY,
  QSTASH_NEXT_SIGNING_KEY,
  RESEND_API_KEY,
} = Bun.env;
