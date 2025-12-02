import mongoose from "mongoose";

import { v4 as uuidv4 } from "uuid";

const orderSchema = new mongoose.Schema(
  
   { orderId: {
  type: String,
  required: true,
  unique: true,
  default: () => uuidv4()},
    customerName: { type: String, required: true },
    customerType: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String },
    poNumber: { type: String }, // ✅ added
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        pricePerUnit: { type: Number, required: true },
        eachUnitWeight:{type:Number,required:true}, // ✅ added
      }
    ],
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
      default: "Pending",
    },
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryCity: { type: String, required: true },
    deliveryState: { type: String, required: true },
    deliveryPincode: { type: String },
    deliveryDate: { type: String, required: true },
    deliveryTimeSlot: { type: String, required: true }, // ✅ removed enum
    assignedVehicle: { type: String },
    driverName: { type: String },
    driverContact: { type: String },
    warehouseLocation: { type: String },
    orderedDate:{ type: String }, // ✅ added
    remarks: { type: String },
    vendorGSTIN: { type: String }, // ✅ added
    vendorName: { type: String }, // ✅ added
    vendorAddress: { type: String }, // ✅ added
    createdBy: {type:String,ref:"User",required:true}
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;



