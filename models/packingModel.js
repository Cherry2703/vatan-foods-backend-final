// models/PackingRecord.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const packingHistorySchema = new mongoose.Schema({
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String }, // userId or username
  previousData: { type: Object, required: true },
});

const packingRecordSchema = new mongoose.Schema({
  packingId: { type: String, default: uuidv4 },
  batchId: { type: String, required: true },
  cleaningId: { type: String },
  shift: { type: String },
  packingType: {
    type: String,
    enum: ["Initial Packaging", "Final Packaging"],
    default: "Final Packaging",
  },
  inputFromRaw: { type: Number, default: 0 },
  inputFromCleaning: { type: Number, default: 0 },
  outputPacked: { type: Number, default: 0 },
  numberOfBags: { type: Number, default: 0 },
  bagWeight: { type: Number, default: 0 },
  wastage: { type: Number, default: 0 },
  workers: [{ type: String }],
  noOfPackets: { type: Number, default: 0 },
  packetsInEachBag: { type: Number, default: 0 },

  vendorName: {type:String},
brandName: {type:String},
itemName: {type:String},

  managerId: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Ongoing", "Completed"],
    default: "Pending",
  },
  pendingReason: {
    type: String,
    enum: ["Stock shortage", "Machine issue", "Labor shortage", "Other", null],
  },
  remarks: { type: String },
  // ✅ New field: history of changes
  history: [packingHistorySchema],
}, { timestamps: true });

export default mongoose.model("PackingRecord", packingRecordSchema);
