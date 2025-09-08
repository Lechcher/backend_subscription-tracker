/**
 * User Model Definition
 * 
 * This file defines the Mongoose database model for user data, which acts as the
 * persistence layer for the user schema. It bridges the gap between the
 * Zod validation schema and MongoDB database operations.
 * 
 * Key features:
 * - Type-safe schema definition using TypeScript and Mongoose
 * - Schema validation rules that align with the Zod schema
 * - Automatic timestamps for created/modified records
 * - Unique constraint on email field
 * - Integration with the validation layer for data consistency
 */
import { Schema, model } from "mongoose";
import { userSchemaType } from "./user.schema";

/**
 * Mongoose user schema definition
 * 
 * Defines the database schema for user records with strict type safety.
 * This schema mirrors the validation rules defined in user.schema.ts
 * and enforces data consistency at the database level.
 * 
 * Schema options:
 * - timestamps: Automatically adds createdAt and updatedAt fields
 * - type: Uses TypeScript interface for compile-time validation
 * 
 * Field validations align with the Zod schema for consistency:
 * - name: Required string field
 * - email: Required unique string field (enforced at database level)
 * - password: Required string field
 */
const userSchemaModel = new Schema<userSchemaType>(
  {
    // User name field - display name for the user
    name: {
      type: String, // String data type
      required: [true, "User name is required!"], // Database-level validation
    },
    
    // User email field - unique identifier for authentication
    email: {
      type: String, // String data type
      required: [true, "User email is required!"], // Database-level validation
      unique: true, // MongoDB unique index constraint
      // Note: The unique constraint at the database level provides
      // duplicate prevention that complements the Zod schema validation
    },
    
    // User password field - hashed authentication credential
    password: {
      type: String, // String data type
      required: [true, "User password is required!"], // Database-level validation
      // Note: Passwords should always be stored as hashed values
      // (this is typically handled by pre-save hooks or auth services)
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

/**
 * Mongoose user model
 * 
 * Provides the interface for database operations on user collections.
 * This model wraps the schema and provides methods for:
 * - Creating, reading, updating, and deleting user records
 * - Querying the user collection with various filters
 * - Aggregation operations on user data
 * 
 * Type safety ensures that all model operations adhere to the
 * userSchemaType interface, preventing runtime type errors.
 */
const User = model<userSchemaType>("User", userSchemaModel);

/**
 * Default export for user model
 * 
 * Making the model the default export allows easy import across
 * the application without worrying about named imports.
 * 
 * Usage examples:
 * - Import: `import User from "./user.model"`
 * - Create: `const newUser = new User({ name: "John", email: "john@example.com", password: "hashedPassword" });`
 * - Find: `const users = await User.find({ email: "john@example.com" });`
 * - Update: `await User.updateOne({ email: "john@example.com" }, { $set: { name: "Jonathan" } });`
 */
export default User;
