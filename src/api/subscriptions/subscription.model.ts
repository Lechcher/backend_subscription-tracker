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
    name: {
      type: String,
      required: [true, "Subscription name is required"],
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "JPY", "CNY", "VND"],
      default: "USD",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
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
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
    },
    renewalDate: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
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
