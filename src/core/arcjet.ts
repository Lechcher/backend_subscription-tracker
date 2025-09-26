/**
 * Arcjet Security Configuration
 *
 * This file configures Arcjet, a security service that provides bot detection,
 * rate limiting, and DDoS protection for the application.
 *
 * Security Features:
 * - Shield: Basic DDoS protection and bot detection
 * - Bot Detection: Identifies and allows search engine bots while blocking malicious bots
 * - Rate Limiting: Prevents abuse using token bucket algorithm
 *
 * Configuration Details:
 * - Mode: Set to "LIVE" for production security enforcement
 * - Characteristics: Tracks requests by IP address for rate limiting
 * - Token Bucket: Allows 5 tokens per 10 seconds with capacity of 10 tokens
 *
 * Usage:
 * import aj from './arcjet';
 *
 * The middleware applies these rules to all incoming requests to protect
 * the API from automated attacks and abuse.
 */

import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/bun";
import { ARCJET_KEY } from "../core/env";

// Initialize Arcjet with security configuration
const aj = arcjet({
  key: ARCJET_KEY!, // Arcjet API key for service authentication
  characteristics: ["ip.src"], // Track requests by source IP for rate limiting

  // Define security rules to be applied to all requests
  rules: [
    // Shield mode provides basic DDoS protection and bot detection
    // LIVE mode enforces security rules in production
    shield({ mode: "LIVE" }),

    // Bot detection with specific allowances
    // Allows search engine bots while blocking other automated requests
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"], // Whitelist search engine bots
    }),

    // Rate limiting using token bucket algorithm
    // Prevents abuse by limiting request frequency
    tokenBucket({
      mode: "LIVE", // Enforce rate limiting in production
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Maximum bucket capacity (burst limit)
    }),
  ],
});

export default aj;
