import mongoose from "mongoose";
import { MONGODB_URI, NODE_ENV } from "./env";

// Check if the database URI is provided, throw an error if not
if (!MONGODB_URI) {
  throw new Error(
    `Please provide a valid DB_URI inside .env.${NODE_ENV}.local`
  );
}

// Function to connect to the MongoDB database
const connectToDatabase = async () => {
  try {
    // Attempt to connect to the database using the provided URI
    await mongoose.connect(MONGODB_URI!);

    // Log success message with the current environment mode
    console.log(`Connected to database in ${NODE_ENV} mode! 🗃️`);
  } catch (error) {
    // Log error if connection fails and exit the process
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

// Export the connection function to be used in the application
export default connectToDatabase;
