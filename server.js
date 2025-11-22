// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import incomingRoutes from "./routes/incomingRoutes.js";
// import cleaningRoutes from "./routes/cleaningRoutes.js";
// import packingRoutes from "./routes/packingRoutes.js";
// import dispatchRoutes from "./routes/dispatchRoutes.js";
// import ordersRoutes from "./routes/ordersroutes.js";
// import IncomingMaterial from "./models/incomingModel.js";
// import CleaningRecord from "./models/cleaningModel.js";
// import PackingRecord from "./models/packingModel.js";
// import DispatchRecord from "./models/dispatchRecord.js";
// import Order from "./models/ordersModel.js";
// import User from "./models/userModel.js";

// // import trackBatch from "./routes/trackOrder.js";
// dotenv.config();
// const app = express();
 
// // Middleware
// app.use(express.json());
// app.use(cors()); 
// app.use(express.urlencoded({ extended: true })); // if sending form-data


// // Connect DB   
// connectDB();

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/incoming", incomingRoutes);
// app.use("/api/cleaning", cleaningRoutes);
// app.use("/api/packing", packingRoutes);
// app.use("/api/dispatch", dispatchRoutes);
// app.use("/api/orders", ordersRoutes); // Added orders route
// // app.use("/api/batch/track", trackBatch); // Track order route



// app.post("/api/batch/track", async (req, res) => {
//   try {
//     const { batchId } = req.body;
//     console.log(batchId);
    

//     if (!batchId) {
//       return res.status(400).json({ message: "Batch ID is required" });
//     }

//     // Find incoming stage (raw material)
//     const incoming = await IncomingMaterial.findOne({ batchId });

//     // Find cleaning stage
//     const cleaning = await CleaningRecord.findOne({ batchId });

//     // Find packing stage(s)
//     const packing = await PackingRecord.find({ batchId });

//     // Find dispatch info
//     const dispatch = await DispatchRecord.findOne({ batchId });

//     // Find ANY order where this batchId is used inside items array
//     const order = await Order.findOne({ "items.batchId": batchId });

//     // If nothing found at all
//     if (!incoming && !cleaning && packing.length === 0 && !dispatch) {
//       return res.status(404).json({
//         message: "No tracking data found for this Batch ID",
//       });
//     }

//     // Response object
//     const trackingData = {
//       batchId,
//       incoming: incoming || null,
//       cleaning: cleaning || null,
//       packing: packing.length ? packing : null,
//       dispatch: dispatch || null,
//       linkedOrder: order || null,
//     };

//     // console.log(trackingData);
    

//     return res.status(200).json(trackingData);
//   } catch (err) {
//     console.error("❌ Error tracking batch:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });




// app.get("/reports/all", async (req, res) => {
//   try {
//     const incoming = await IncomingMaterial.find({});
//     const cleaning = await CleaningRecord.find({});
//     const packing = await PackingRecord.find({});
//     const dispatch = await DispatchRecord.find({});
//     const employees = await User.find({});
//     const order = await Order.find({}); // FIXED

//     return res.status(200).json({
//       success: true,
//       message: "All reports fetched",
//       data: {
//         incoming,
//         cleaning,
//         packing,
//         dispatch,
//         employees,
//         order
//       }
//     }); 

//   } catch (error) {
//     console.error("Reports error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching reports",
//       error: error.message
//     });
//   }
// });


  
 

// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));





















const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors"); 
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
require("dotenv").config();



app.use(
  cors({
    origin: "*",          // or "http://localhost:3000"
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


//--------------------------------------------------
// USER MODEL
//--------------------------------------------------
const userSchema = new mongoose.Schema(
  {
    uuid: { type: String, default: uuidv4, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Operator"],
      default: "Operator",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);


//--------------------------------------------------
// HISTORY MODEL
//--------------------------------------------------
const historySchema = new mongoose.Schema(
  {
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


 





// -----------------   ORDER MODELS -----------------------

//--------------------------------------------------
// ORDER MODEL
//--------------------------------------------------

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, default: uuidv4, unique: true },

    customerName: { type: String, required: true },
    customerType: { type: String, enum: ["Retail", "Wholesale"], required: true },
    contactPerson: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },

    poNumber: { type: String },

    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        pricePerUnit: { type: Number, required: true },
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
    deliveryTimeSlot: { type: String, required: true },

    assignedVehicle: { type: String },
    driverName: { type: String },
    driverContact: { type: String },

    warehouseLocation: { type: String },

    orderedDate: { type: String },

    remarks: { type: String },

    vendorGSTIN: { type: String },
    vendorName: { type: String },
    vendorAddress: { type: String },
    createdBy: {type:String,ref:"User",required:true}
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);









//--------------------------------------------------
// INCOMING MATERIAL MODEL
//--------------------------------------------------
const incomingSchema = new mongoose.Schema(
  {
    incomingId: { type: String, default: uuidv4, unique: true },
    batchId: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },

    billNo: String,
    vendorName: { type: String, required: true },
    vendorAddress: String,

    itemName: { type: String, required: true },
    totalBags: Number,
    weightPerBag: Number,

    unit: {
      type: String,
      enum: ["kg", "gms", "litre", "pcs"],
      default: "kg",
    },

    totalQuantity: Number,
    vehicleNo: String,
    driverName: String,
    remarks: String,

    createdBy: { type: String, ref: "User", required: true },
  },
  { timestamps: true }
);


const Incoming = mongoose.model("Incoming", incomingSchema);


//--------------------------------------------------
// CLEANING MODEL
//--------------------------------------------------
const cleaningSchema = new mongoose.Schema(
  {
    cleaningId: { type: String, default: uuidv4, unique: true },
    batchId: { type: String, required: true },
    incomingId: String,

    timestamp: { type: Date, default: Date.now },
    cycleNumber: { type: Number, default: 1 },
    previousOutput: { type: Number, default: 0 },

    itemName: { type: String, required: true },
    cleaningType: { type: String, enum: ["Manual", "Machine"], required: true },

    inputQuantity: { type: Number, required: true },
    outputQuantity: { type: Number, required: true },
    wastageQuantity: { type: Number, required: true },

    unit: { type: String, enum: ["kg", "g", "litre", "pcs"], default: "kg" },

    operator: { type: String, required: true },
    supervisor: String,

    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night"],
      required: true,
    },

    signed: { type: Boolean, default: false },
    remarks: { type: String, default: "" },

    usedQuantity: { type: Number, required: true },
    remainingAfterCleaning: { type: Number, required: true },

    createdBy: { type: String, ref: "User", required: true },
  },
  { timestamps: true }
);

const Cleaning = mongoose.model("Cleaning", cleaningSchema);


//--------------------------------------------------
// PACKING MODEL
//--------------------------------------------------
const packingHistorySchema = new mongoose.Schema({
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String },
  previousData: { type: Object, required: true },
});

const packingSchema = new mongoose.Schema(
  {
    packingId: { type: String, default: uuidv4 },
    batchId: { type: String, required: true },
    cleaningId: String,

    shift: String,

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

    workers: [String],
    noOfPackets: { type: Number, default: 0 },
    packetsInEachBag: { type: Number, default: 0 },

    vendorName: String,
    brandName: String,
    itemName: String,
    managerId: String,

    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending",
    },

    pendingReason: {
      type: String,
      enum: ["Stock shortage", "Machine issue", "Labor shortage", "Other", null],
    },

    remarks: String,
    createdBy:{type:String, ref:"User",required:true},
    history: [packingHistorySchema],
  },
  { timestamps: true }
);

const Packing = mongoose.model("Packing", packingSchema);


//--------------------------------------------------
// AUTH MIDDLEWARE
//--------------------------------------------------
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, "SECRET123");
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};


//--------------------------------------------------
// AUTH ROUTES
//--------------------------------------------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "SECRET123", { expiresIn: "7d" });

    res.json({ user,token });
  } catch (err) {
    res.status(500).json(err);
  }
});


//--------------------------------------------------
// GENERIC HISTORY SAVER
//--------------------------------------------------
async function saveHistory(batchId, model, action, data, updatedBy) {
  await History.create({ batchId, model, action, data, updatedBy });
}


//--------------------------------------------------
// CRUD ROUTES
//--------------------------------------------------

// Incoming ------------------------------------------------------------
app.post("/api/incoming", protect, async (req, res) => {
  try {
    const incoming = await Incoming.create(req.body);
    await saveHistory(incoming.batchId, "Incoming", "CREATE", incoming, req.user.name);
    res.json(incoming);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/incoming", protect, async (req, res) => {
  const data = await Incoming.find({});
  res.json(data);
});

app.get("/api/incoming/:batchId",protect, async (req, res) => {
  const data = await Incoming.findOne({ batchId: req.params.batchId });
  res.json(data);
});

app.put("/api/incoming/:batchId", protect, async (req, res) => {
  try {
    console.log(req);
    
    const previous = await Incoming.findOne({ batchId: req.params.batchId });
    const updated = await Incoming.findOneAndUpdate(
      { batchId: req.params.batchId },
      req.body,
      { new: true }
    );

    await saveHistory(updated.batchId, "Incoming", "UPDATE", { previous, updated }, req.user.name);
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/api/incoming/:batchId", protect, async (req, res) => {
  try {
    const deleted = await Incoming.findOneAndDelete({ batchId: req.params.batchId });
    await saveHistory(req.params.batchId, "Incoming", "DELETE", deleted, req.user.name);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});


// Cleaning ------------------------------------------------------------
app.post("/api/cleaning", protect, async (req, res) => {
  try {
    const clean = await Cleaning.create(req.body);
    await saveHistory(clean.batchId, "Cleaning", "CREATE", clean, req.user.name);
    res.json(clean);
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/api/cleaning", protect, async (req, res) => {
  const data = await Cleaning.find({});
  res.json(data);
});

app.get("/api/cleaning/:batchId",protect, async (req, res) => {
  const data = await Cleaning.findOne({ batchId: req.params.batchId });
  res.json(data);
});

app.put("/api/cleaning/:id", protect, async (req, res) => {
  try {
    const previous = await Cleaning.findOne({batchId:req.params.id});
    //const updated = await Cleaning.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const updated = await Cleaning.findOneAndUpdate(
      { batchId: req.params.id },
      req.body,
      { new: true }
    );

    await saveHistory(updated.batchId, "Cleaning", "UPDATE", { previous, updated }, req.user.name);
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});


app.delete("/api/cleaning/:batchId", protect, async (req, res) => {
  try {
    const deleted = await Cleaning.findOneAndDelete({ batchId: req.params.batchId });
    await saveHistory(req.params.batchId, "Cleaning", "DELETE", deleted, req.user.name);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Packing ------------------------------------------------------------
app.post("/api/packing", protect, async (req, res) => {
  try {
    const pack = await Packing.create(req.body);
    await saveHistory(pack.batchId, "Packing", "CREATE", pack, req.user.name);
    res.json(pack);
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/api/packing", protect, async (req, res) => {
  const data = await Packing.find({});
  res.json(data);
});

app.get("/api/packing/:batchId",protect, async (req, res) => {
  const data = await Packing.findOne({ batchId: req.params.batchId });
  res.json(data);
});

// app.put("/api/packing/:id", protect, async (req, res) => {
// try {
//     const previous = await Packing.findOne({_id:req.params.id});
//     //const updated = await Cleaning.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     const updated = await Packing.findOneAndUpdate(
//       { batchId: req.params.id },
//       req.body,
//       { new: true }
//     );

//     await saveHistory(updated.batchId, "Packing", "UPDATE", { previous, updated }, req.user.name);
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });



// Update packing entry
app.put("/api/packing/:id", protect, async (req, res) => {
  try {
    // find by unique _id
    const previous = await Packing.findById(req.params.id);
    if (!previous) return res.status(404).json({ message: "Packing record not found" });

    const updated = await Packing.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await saveHistory(updated.batchId, "Packing", "UPDATE", { previous, updated }, req.user.name);
    res.json(updated);
  } catch (err) {
    console.error("PUT /api/packing/:id error:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
});




// app.delete("/api/packing/:batchId", protect, async (req, res) => {
//   try {
//     const deleted = await Packing.findOneAndDelete({ _id: req.params.batchId });
//     await saveHistory(req.params.batchId, "Packing", "DELETE", deleted, req.user.name);
//     res.json({ message: "Deleted" });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });



// Delete packing entry
app.delete("/api/packing/:id", protect, async (req, res) => {
  try {
    const deleted = await Packing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Packing record not found" });

    await saveHistory(deleted.batchId, "Packing", "DELETE", deleted, req.user.name);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/packing/:id error:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
});


//--------------------------------------------------
// GET COMPLETE TRACIBILITY
//--------------------------------------------------
app.get("/api/batch/track/:batchId", async (req, res) => {
  const batchId = req.params.batchId;

  const incoming = await Incoming.findOne({ batchId });
  const cleaning = await Cleaning.find({ batchId });
  const packing = await Packing.find({ batchId });
  const history = await History.find({ batchId });

  res.json({ batchId, incoming, cleaning, packing, history });
});

app.get("/api/complete-history", protect, async (req, res) => {
  try {
    const history = await History.find({}); 
    res.json(history);
  } catch (err) {
    res.status(500).json(err);
  }
});




app.get("/api/employees", protect, async (req, res) => {
  try {
    // Fetch all users except those with role "Admin"
    const employees = await User.find(
      { role: { $ne: "Admin" } }, // $ne means "not equal"
      "-password" // exclude password field for safety
    ).sort({ createdAt: -1 }); // newest first (optional)

    // Return employees list
    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});











//--------------------------------------------------
// ORDERS CRUD + HISTORY
//--------------------------------------------------

// CREATE ORDER
app.post("/api/orders", protect, async (req, res) => {
  try {
    const order = await Order.create(req.body);

    await saveHistory(
      order.orderId,
      "Order",
      "CREATE",
      order,
      req.user?.name || "System"
    );

    res.json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL ORDERS
app.get("/api/orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET SINGLE ORDER BY orderId
app.get("/api/orders/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    res.json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

// // UPDATE ORDER
// app.put("/api/orders/:orderId", protect, async (req, res) => {
//   try {
//     const previous = await Order.findOne({ orderId: req.params.orderId });

//     const updated = await Order.findOneAndUpdate(
//       { orderId: req.params.orderId },
//       req.body,
//       { new: true }
//     );

//     await saveHistory(
//       updated.orderId,
//       "Order",
//       "UPDATE",
//       { previous, updated },
//       req.user?.name || "System"
//     );

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

app.put("/api/orders/:orderId", protect, async (req, res) => {
  try {
    const previous = await Order.findOne({ orderId: req.params.orderId });

    const updated = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      req.body,
      { new: true }
    );

    await saveHistory(
      updated.orderId,
      "Order",
      "UPDATE",
      { previous, updated },
      req.user?.name || "System"
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});



// DELETE ORDER
app.delete("/api/orders/:orderId", protect, async (req, res) => {
  try {
    const deleted = await Order.findOneAndDelete({
      orderId: req.params.orderId,
    });

    await saveHistory(
      req.params.orderId,
      "Order",
      "DELETE",
      deleted,
      req.user?.name || "System"
    );

    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});



//--------------------------------------------------
// START SERVER
//--------------------------------------------------
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));