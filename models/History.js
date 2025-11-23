import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";





const historySchema = new mongoose.Schema(
  {
    historyId: { type: String, default: uuidv4, unique: true },
    batchId: { type: String, required: true },
    model: { type: String, required: true }, // Incoming, Cleaning, Packing
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
    },
    data: { type: Object, required: true },
    updatedBy: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
 
const History = mongoose.model("History", historySchema);

export default History;