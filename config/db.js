import mongoose from "mongoose";

console.log("mongo uri", process.env.MONGO_URI);

const MONGO_URI = "mongodb+srv://ramcharanamr2408_db_user:kZ3UaaVlEZzoBUH8@cluster0.kcqwxxv.mongodb.net/vatanFoodsDB"

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });

    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
