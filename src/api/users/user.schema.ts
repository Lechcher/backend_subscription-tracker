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
    .refine((email) => {
      // Basic anti-spam measure: check for common disposable email patterns
      const disposableDomains = [
        "tempmail",
        "10minutemail",
        "guerrillamail",
        "mailinator",
      ];
      // Split email into parts and safely access domain
      const [, domain] = email.split("@");
      // Only validate if domain exists (it should, due to .email() check above)
      return domain
        ? !disposableDomains.some((disposable) => domain.includes(disposable))
        : false;
    }, "Disposable email addresses are not allowed"),

  // Password field with security requirements for user authentication
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long") // Minimum password length
    .max(128, "Password cannot exceed 128 characters") // Maximum password length
    .regex(
      /[A-Z]/, // At least one uppercase letter
      "Password must contain at least one uppercase letter"
    )
    .regex(
      /[a-z]/, // At least one lowercase letter
      "Password must contain at least one lowercase letter"
    )
    .regex(
      /[0-9]/, // At least one number
      "Password must contain at least one number"
    )
    .regex(
      /[^A-Za-z0-9]/, // At least one special character
      "Password must contain at least one special character"
    ),
});

/**
 * TypeScript interface for user data type
 *
 * This interface represents the type-safe structure of user data
 * that matches the Zod schema. It's used throughout the application
 * for type checking and IntelliSense support.
 */
export type userSchemaType = z.infer<typeof userSchema>;
