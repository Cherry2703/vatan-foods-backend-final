import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const incomingSchema = new mongoose.Schema(
  {
    incomingId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    batchId: {
      type: String,
      required: true,
      unique: true,
    },
    timestamp: { type: Date, default: Date.now },
    billNo: { type: String },
    vendorName: { type: String, required: true },
    vendorAddress: { type: String },
    itemName: { type: String, required: true },
    totalBags: { type: Number },
    weightPerBag: { type: Number },
    unit: { type: String, enum: ["kg", "gms", "litre", "pcs"], default: "kg" },
    totalQuantity: { type: Number },
    vehicleNo: { type: String },
    driverName: { type: String },
    remarks: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("IncomingMaterial", incomingSchema);
