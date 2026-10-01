import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "Error: MONGODB_URI is not defined in environment variables.",
    );
    process.exit(1);
  }
  try {
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connection established successfully");
    });
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};
