/**
 * User Schema Definition
 * 
 * This file defines the Zod schema for user data validation, used primarily for
 * user registration and authentication. It implements comprehensive validation
 * rules to ensure data integrity, security best practices, and consistency
 * across the user management system.
 * 
 * Key validation areas:
 * - Username: Length and character restrictions
 * - Email: Format validation and anti-spam measures
 * - Password: Security requirements including complexity rules
 * 
 * The schema uses Zod's type-safe validation to prevent malformed user data
 * and enforce security standards.
 */
import { z } from "zod";

/**
 * User validation schema
 * 
 * Defines comprehensive validation rules for user account data including:
 * - Username validation with length and character restrictions
 * - Email validation with format checks and anti-spam measures
 * - Password validation with security complexity requirements
 * 
 * This schema is used for user registration, authentication, and profile
 * management throughout the application.
 */
export const userSchema = z.object({
  // Username field with length and character validation
  name: z
    .string()
    .trim() // Remove leading/trailing whitespace
    .min(2, "User name must be at least 2 characters long") // Minimum length requirement
    .max(50, "User name cannot exceed 50 characters") // Reasonable maximum length
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/, // Alphanumeric with spaces, hyphens, underscores
      "User name can only contain letters, numbers, spaces, hyphens and underscores"
    ),

  // Email field with comprehensive validation and security measures
  email: z
    .string()
    .trim() // Remove whitespace
    .toLowerCase() // Convert to lowercase for consistency and case-insensitive lookups
    .min(5, "Email must be at least 5 characters long") // Minimum practical email length
    .max(254, "Email cannot exceed 254 characters") // RFC 5321 maximum email length
    .email("Please enter a valid email address") // Standard email format validation
    .refine(
      (email) => !email.endsWith("@example.com"), // Block common test domains
      "Please use a real email address"
    ),

  // Password field with security complexity requirements
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long") // Minimum length requirement
    .max(100, "Password cannot exceed 100 characters") // Maximum length limit
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, // Complex regex pattern
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
    // Note: This regex enforces password complexity requiring:
    // - At least one lowercase letter [a-z]
    // - At least one uppercase letter [A-Z] 
    // - At least one digit [\d]
    // - At least one special character [@$!%*?&]
    // - Total length between 8-100 characters
});

/**
 * TypeScript type inferred from the user schema
 * 
 * Provides type safety for user-related data throughout the application.
 * This type ensures that any user data conforming to this schema will have:
 * - Proper string types for all fields
 * - Consistent formatting (e.g., lowercase emails)
 * - Correct validation guarantees
 * 
 * Used in:
 * - User registration endpoints
 * - Authentication middleware
 * - Database models
 * - Profile management functions
 */
export type userSchemaType = z.infer<typeof userSchema>;
