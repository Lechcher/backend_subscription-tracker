import mongoose, { Schema, model } from "mongoose";
import { subscriptionSchemaType } from "./subscription.schema";

/**
 * Subscription Model - Defines the data structure and behavior for subscription records
 *
 * This model handles:
 * - Subscription metadata (name, price, currency, frequency, category)
 * - Payment and status tracking
 * - Date management with automatic renewal calculations
 * - User association via reference
 */
const subscriptionSchemaModel = new Schema<subscriptionSchemaType>(
  {
    // Name of the subscription service
    name: {
      type: String,
      required: [true, "Subscription name is required"],
    },
    // Price of the subscription
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
    },
    // Currency of the subscription price
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "JPY", "CNY", "VND"],
      default: "USD",
    },
    // Billing frequency of the subscription
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    // Category of the subscription for organization
    category: {
      type: String,
      enum: [
        "education",
        "entertainment",
        "finance",
        "health",
        "lifestyle",
        "music",
        "news",
        "productivity",
        "shopping",
        "sports",
        "technology",
        "other",
      ],
      required: true,
    },
    // Payment method used for the subscription
    paymentMethod: {
      type: String,
      required: true,
    },
    // Current status of the subscription
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    // Date when the subscription was first activated
    startDate: {
      type: Date,
    },
    // Next renewal date for the subscription
    renewalDate: {
      type: Date,
    },
    // Reference to the user who owns this subscription
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster queries by user
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

/**
 * Pre-save middleware - Automatically calculates renewal dates and updates expired status
 *
 * This middleware runs before saving a subscription document and:
 * 1. Automatically calculates renewal date based on frequency if not provided
 * 2. Updates status to 'expired' if renewal date has passed
 *
 * Supported frequencies: daily (1 day), weekly (7 days), monthly (30 days), yearly (365 days)
 */
subscriptionSchemaModel.pre("save", function (next) {
  // Set start date to current date if not provided
  if (!this.startDate) {
    this.startDate = new Date();
  }

  // Calculate renewal date if not provided
  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    // Calculate renewal date by adding frequency period to start date
    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.frequency]
    );
  }

  // Check if subscription has expired and update status accordingly
  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }

  next();
});

/**
 * Subscription Model - Mongoose model for subscription data
 *
 * This model provides the interface for CRUD operations on subscription documents,
 * including all the built-in middleware and schema validation.
 */
const Subscription = model<subscriptionSchemaType>(
  "Subscription",
  subscriptionSchemaModel
);

export default Subscription;
