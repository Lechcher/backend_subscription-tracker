import { Hono } from "hono";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { HandlerError } from "../core/handlerError";

export const registerErrorHandler = (app: Hono) => {
  // Register error handler middleware for the Hono app
  app.onError((err, c) => {
    // Log the error for debugging purposes
    console.error(err);

    // If the error is already a HandlerError, use it directly
    if (err instanceof HandlerError) {
      return c.json(
        {
          success: false,
          error: err.message,
        },
        // cast to any to satisfy Hono's TypeScript overload
        err.statusCode as any
      );
    }

    // Default error for unhandled exceptions
    const error = new HandlerError("Internal Server Error", 500);

    // Handle MongoDB CastError (invalid ObjectId format)
    if (err instanceof mongoose.Error.CastError) {
      error.message = "Resource not found";
      error.statusCode = 404;
    }

    // Handle MongoDB duplicate key error (e.g., unique constraint violation)
    if (
      typeof (err as any).code !== "undefined" &&
      (err as any).code === 11000
    ) {
      error.message = "Duplicate field value entered";
      error.statusCode = 400; // Bad Request
    }

    // Handle MongoDB validation errors
    if (err instanceof mongoose.Error.ValidationError) {
      error.message = Object.values(err.errors)
        .map((val: any) => val.message)
        .join(", ");
      error.statusCode = 400; // Bad Request
    }

    // Handle Zod validation errors (from request body validation)
    if (err instanceof ZodError) {
      error.message = err.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      error.statusCode = 400; // Bad Request
    }

    // Return standardized error response
    return c.json(
      {
        success: false,
        error: error.message,
      },
      // cast to any to satisfy Hono's TypeScript overload
      error.statusCode as any
    );
  });
};
