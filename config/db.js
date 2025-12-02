// import mongoose from "mongoose";
// import dotenv from "dotenv";

// // Load env variables
// dotenv.config();

// const connectDB = async () => {
//   console.log("MONGO_URI:", process.env.MONGO_URI); // should print the URI now

//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       autoIndex: true,
//     });

//     console.log("MongoDB Connected Successfully");
//   } catch (err) {
//     console.error("❌ MongoDB Error:", err.message);
//     process.exit(1);
//   }
// };



// export default connectDB;




import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // ⬅ Render fix: fail fast if cluster slow
      socketTimeoutMS: 45000,         // ⬅ Prevent infinite wait
      maxPoolSize: 10,                // Optional but good for free tier
      autoIndex: false,               // ⬅ Prevent index creation delays in production
    });

    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
