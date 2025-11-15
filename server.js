import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import incomingRoutes from "./routes/incomingRoutes.js";
import cleaningRoutes from "./routes/cleaningRoutes.js";
import packingRoutes from "./routes/packingRoutes.js";
import dispatchRoutes from "./routes/dispatchRoutes.js";
import ordersRoutes from "./routes/ordersroutes.js";
import IncomingMaterial from "./models/incomingModel.js";
import CleaningRecord from "./models/cleaningModel.js";
import PackingRecord from "./models/packingModel.js";
import DispatchRecord from "./models/dispatchRecord.js";
import Order from "./models/ordersModel.js";
import User from "./models/userModel.js";

// import trackBatch from "./routes/trackOrder.js";
dotenv.config();
const app = express();
 
// Middleware
app.use(express.json());
app.use(cors()); 
app.use(express.urlencoded({ extended: true })); // if sending form-data


// Connect DB   
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/incoming", incomingRoutes);
app.use("/api/cleaning", cleaningRoutes);
app.use("/api/packing", packingRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/orders", ordersRoutes); // Added orders route
// app.use("/api/batch/track", trackBatch); // Track order route



app.post("/api/batch/track", async (req, res) => {
  try {
    const { batchId } = req.body;
    console.log(batchId);
    

    if (!batchId) {
      return res.status(400).json({ message: "Batch ID is required" });
    }

    // Find incoming stage (raw material)
    const incoming = await IncomingMaterial.findOne({ batchId });

    // Find cleaning stage
    const cleaning = await CleaningRecord.findOne({ batchId });

    // Find packing stage(s)
    const packing = await PackingRecord.find({ batchId });

    // Find dispatch info
    const dispatch = await DispatchRecord.findOne({ batchId });

    // Find ANY order where this batchId is used inside items array
    const order = await Order.findOne({ "items.batchId": batchId });

    // If nothing found at all
    if (!incoming && !cleaning && packing.length === 0 && !dispatch) {
      return res.status(404).json({
        message: "No tracking data found for this Batch ID",
      });
    }

    // Response object
    const trackingData = {
      batchId,
      incoming: incoming || null,
      cleaning: cleaning || null,
      packing: packing.length ? packing : null,
      dispatch: dispatch || null,
      linkedOrder: order || null,
    };

    // console.log(trackingData);
    

    return res.status(200).json(trackingData);
  } catch (err) {
    console.error("❌ Error tracking batch:", err);
    return res.status(500).json({ error: "Server error" });
  }
});




app.get("/reports/all", async (req, res) => {
  try {
    const incoming = await IncomingMaterial.find({});
    const cleaning = await CleaningRecord.find({});
    const packing = await PackingRecord.find({});
    const dispatch = await DispatchRecord.find({});
    const employees = await User.find({});
    const order = await Order.find({}); // FIXED

    return res.status(200).json({
      success: true,
      message: "All reports fetched",
      data: {
        incoming,
        cleaning,
        packing,
        dispatch,
        employees,
        order
      }
    }); 

  } catch (error) {
    console.error("Reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message
    });
  }
});


  
 

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
