import mongoose from "mongoose";

// Get the current node environment from environment variables
const nodeEnv = Bun.env.NODE_ENV;
// Get the MongoDB connection URI from environment variables
const dbUri = Bun.env.MONGODB_URI;

// Check if the database URI is provided, throw an error if not
if (!dbUri) {
  throw new Error(`Please provide a valid DB_URI inside .env.${nodeEnv}.local`);
}

// Function to connect to the MongoDB database
const connectToDatabase = async () => {
  try {
    // Attempt to connect to the database using the provided URI
    await mongoose.connect(dbUri);

    // Log success message with the current environment mode
    console.log(`Connected to database in ${nodeEnv} mode! 🗃️`);
  } catch (error) {
    // Log error if connection fails and exit the process
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

// Export the connection function to be used in the application
export default connectToDatabase;
