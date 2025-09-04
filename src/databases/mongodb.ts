import mongoose from "mongoose";

const nodeEnv = Bun.env.NODE_ENV;
const dbUri = Bun.env.MONGODB_URI;

if (!dbUri) {
  throw new Error(`Please provide a valid DB_URI inside .env.${nodeEnv}.local`);
}

const connectToDatabase = async () => {
    try {
      await mongoose.connect(dbUri);

      console.log(`Connected to database in ${nodeEnv} mode! 🗃️`);
    } catch (error) {
        console.error("Error connecting to database:", error);
        process.exit(1);
    }
}

export default connectToDatabase;
