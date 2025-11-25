import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

const connectDB = async () => {
  console.log("MONGO_URI:", process.env.MONGO_URI); // should print the URI now

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });

    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
