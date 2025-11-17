import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  
   { orderId: {
  type: String,
  required: true,
  unique: true,
  default: () => uuidv4()},
    customerName: { type: String, required: true },
    customerType: { type: String, enum: ["Retail", "Wholesale"], required: true },
    contactPerson: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    poNumber: { type: String }, // ✅ added
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        pricePerUnit: { type: Number, required: true },
        // batchNo: { type: String } // ✅ added
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
    deliveryPincode: { type: String, required: true },
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
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;



// -----------NEED to upgrade this model---------------

// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";

// const orderSchema = new mongoose.Schema(
//   {
//     orderId: {
//       type: String,
//       required: true,
//       unique: true,
//       default: () => uuidv4(),
//     },

//     // 🔹 Customer / Vendor Info
//     customerName: { type: String, required: true }, // e.g., Moonstone Ventures LLP
//     customerType: { type: String, enum: ["Retail", "Wholesale"], required: true },
//     contactPerson: { type: String },
//     contactNumber: { type: String },
//     email: { type: String },

//     // 🔹 PO / Order Info
//     poNumber: { type: String }, // e.g., 6769410062566
//     poDate: { type: Date },
//     deliveryDate: { type: Date },
//     orderSource: { type: String, enum: ["Manual", "PDF"], default: "Manual" },

//     // 🔹 Delivery Info
//     deliveryAddress: { type: String },
//     deliveryCity: { type: String },
//     deliveryState: { type: String },
//     deliveryPincode: { type: String },
//     deliveryTimeSlot: { type: String },

//     // 🔹 Logistics Info
//     assignedVehicle: { type: String },
//     driverName: { type: String },
//     driverContact: { type: String },
//     warehouseLocation: { type: String },

//     // 🔹 Vendor (Receiver) Info — from PDFs
//     vendorName: { type: String }, // e.g., Vatan Foods
//     vendorGSTIN: { type: String },
//     vendorAddress: { type: String },

//     // 🔹 Items Array
//     items: [
//       {
//         name: { type: String, required: true }, // e.g., "Toor Dal (1kg)"
//         quantity: { type: Number, required: true }, // e.g., 2000
//         unit: { type: String, required: true }, // e.g., "Nos" or "kg"
//         hsnCode: { type: String }, // from PDF
//         mrp: { type: Number },
//         pricePerUnit: { type: Number },
//         gstPercent: { type: Number },
//         totalPrice: { type: Number },
//         batchNo: { type: String },
//       },
//     ],

//     // 🔹 Order Summary
//     subTotal: { type: Number },
//     gstAmount: { type: Number },
//     totalAmount: { type: Number, required: true },

//     // 🔹 PDF Upload (optional)
//     pdfUrl: { type: String }, // Cloudinary secure URL
//     pdfPublicId: { type: String }, // for deletion/updating

//     // 🔹 Meta
//     remarks: { type: String },
//     status: {
//       type: String,
//       enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
//       default: "Pending",
//     },
//   },
//   { timestamps: true }
// );

// const Order = mongoose.model("Order", orderSchema);
// export default Order;
