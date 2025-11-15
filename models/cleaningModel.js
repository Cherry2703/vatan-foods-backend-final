import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const cleaningSchema = new mongoose.Schema(
  {
    cleaningId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    batchId: {
      type: String,
      required: true,
    },
    incomingId: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    cycleNumber: {
      type: Number,
      default: 1,
    },
    previousOutput: {
      type: Number,
      default: 0,
    },
    itemName: {
      type: String,
      required: true,
    },
    cleaningType: {
      type: String,
      enum: ["Manual", "Machine"],
      required: true,
    },
    inputQuantity: {
      type: Number,
      required: true,
    },
    outputQuantity: {
      type: Number,
      required: true,
    },
    wastageQuantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["kg", "g", "litre", "pcs"],
      default: "kg",
    },
    operator: {
      type: String,
      required: true,
    },
    supervisor: {
      type: String,
    },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night"],
      required: true,
    },
    signed: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CleaningRecord", cleaningSchema);
