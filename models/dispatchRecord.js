// models/dispatchModel.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const dispatchSchema = new mongoose.Schema(
  {
    dispatchUUID: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    batchId: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        weightPerPack: { type: Number, required: true },
        totalWeight: { type: Number, required: true },
        packingInfo: {
          type: mongoose.Schema.Types.Mixed, // could store packing record data snapshot
          required: true,
        },
        cleaningInfo: {
          type: mongoose.Schema.Types.Mixed, // cleaning record snapshot
          required: true,
        },
      },
    ],
    destination: {
      type: String,
      required: true,
    },
    dispatchedBy: {
      type: String,
      required: true,
    },
    dispatchDate: {
      type: Date,
      default: Date.now,
    },
    vehicleNumber: {
      type: String,
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Dispatched", "Delivered", "Returned", "Pending"],
      default: "Dispatched",
    },

    // 👇 change history (tracks all updates)
    history: [
      {
        changedAt: { type: Date, default: Date.now },
        changedBy: String,
        oldData: mongoose.Schema.Types.Mixed,
        newData: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

const DispatchRecord = mongoose.model("DispatchRecord", dispatchSchema);
export default DispatchRecord;
