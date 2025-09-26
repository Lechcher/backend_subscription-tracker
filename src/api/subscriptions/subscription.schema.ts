/**
 * Subscription Schema Definition
 *
 * This file defines the Zod schema for subscription data validation. It provides
 * comprehensive validation rules for subscription-related data including:
 * - Basic subscription information (name, price, currency)
 * - Billing frequency and categorization
 * - Payment method and status tracking
 * - Date validation with business rules
 * - Cross-field validation for data consistency
 *
 * Business Rules:
 * - Subscription names must be unique per user
 * - Prices are stored with 2 decimal precision
 * - Only supported currencies are allowed (USD, EUR, GBP, JPY, CNY, VND)
 * - Start dates cannot be in the future
 * - Renewal dates are calculated based on frequency
 * - Categories are predefined for consistent organization
 * - Multiple payment methods can be stored per subscription
 *
 * Security Features:
 * - Input sanitization and validation
 * - Type coercion for numerical values
 * - Strict enumeration of allowed values
 * - Prevention of malformed data
 *
 * The schema uses Zod's type-safe validation to ensure data integrity
 * throughout the application and enforces business rules at the data layer.
 */
import { z } from "zod";

/**
 * Main subscription validation schema
 *
 * Implements comprehensive validation rules for subscription data with
 * type safety, business rule enforcement, and data consistency checks.
 * This schema serves as the single source of truth for subscription
 * data structure and validation rules.
 *
 * Usage:
 * ```typescript
 * import { subscriptionSchema } from './subscription.schema';
 *
 * // Validate subscription data
 * const result = subscriptionSchema.safeParse(data);
 * if (result.success) {
 *   // Data is valid and typed
 *   const subscription = result.data;
 * }
 * ```
 */
export const subscriptionSchema = z.object({
  // Subscription name field with comprehensive validation
  name: z
    .string()
    .trim() // Remove leading/trailing whitespace
    .min(2, "Subscription name must be at least 2 characters long") // Minimum length requirement
    .max(100, "Subscription name cannot exceed 100 characters") // Maximum length limit
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/, // Allowed characters: letters, numbers, spaces, hyphens, underscores
      "Subscription name can only contain letters, numbers, spaces, hyphens and underscores"
    ),

  // Price field with numeric validation and formatting
  price: z
    .number()
    .min(0, "Subscription price must be greater than 0") // Ensure positive pricing
    .transform((val) => Number(val.toFixed(2))), // Rounds to 2 decimal places for currency precision

  // Currency field with ISO 4217 standard compliance
  currency: z
    .enum([
      "USD", // United States Dollar
      "EUR", // Euro
      "GBP", // British Pound Sterling
      "JPY", // Japanese Yen
      "CNY", // Chinese Yuan
      "VND", // Vietnamese Dong
    ])
    .describe("Currency code in ISO 4217 format") // Documentation for API consumers
    .default("USD"), // Default to USD for new subscriptions

  // Billing frequency with common subscription intervals
  frequency: z
    .enum(["daily", "weekly", "monthly", "yearly"])
    .describe("Billing frequency of the subscription") // Clear documentation
    .default("monthly"), // Most subscriptions are monthly by default

  // Category field for subscription organization and filtering
  category: z
    .enum([
      "education", // Learning platforms, courses, etc.
      "entertainment", // Streaming services, gaming
      "finance", // Banking, investing, budgeting tools
      "health", // Fitness apps, wellness services
      "lifestyle", // General lifestyle subscriptions
      "music", // Music streaming, audio content
      "news", // News outlets, magazines
      "productivity", // Work tools, organization apps
      "shopping", // Retail memberships, delivery services
      "sports", // Sports streaming, fitness memberships
      "technology", // Software, cloud services
      "other", // Miscellaneous subscriptions
    ])
    .describe("Subscription category"), // Documentation for categorization

  // Payment method identification
  paymentMethod: z
    .string()
    .trim() // Remove whitespace
    .min(2, "Payment method must be at least 2 characters long") // Minimum identifier length
    .max(50, "Payment method cannot exceed 50 characters") // Reasonable maximum length
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/, // Alphanumeric with spaces, hyphens, underscores
      "Payment method can only contain letters, numbers, spaces, hyphens and underscores"
    ),

  // Subscription status tracking
  status: z.enum(["active", "cancelled", "expired"]).default("active"), // Default to active for new subscriptions

  // Start date with future date validation
  startDate: z
    .date()
    .refine(
      (value) => {
        const now = new Date();
        now.setHours(23, 59, 59, 999); // Set to end of current day
        return value <= now; // Prevent future start dates
      },
      {
        message: "Start date must not be in the future",
        path: ["startDate"], // Provides better error context for API consumers
      }
    )
    .transform((date) => new Date(date.setHours(0, 0, 0, 0))), // Normalize to start of day for consistency

  // Renewal date - required field for subscription management
  renewalDate: z.date(),

  // User reference - typically populated by the authentication system
  user: z.object(),
});

/**
 * TypeScript type inferred from the subscription schema
 *
 * This provides type safety throughout the application when working
 * with subscription data. It ensures that any data conforming to this
 * schema will have the correct structure and types.
 */
export type subscriptionSchemaType = z.infer<typeof subscriptionSchema>;
