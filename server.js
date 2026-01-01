import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import incomingRoutes from "./routes/incomingRoutes.js";
import cleaningRoutes from "./routes/cleaningRoutes.js";
import packingRoutes from "./routes/packingRoutes.js";
import trackOrderRoutes from "./routes/trackOrder.js";
import companyRoutes from "./routes/companyRoutes.js";
import reportRoutes from "./routes/reportsRoutes.js";

import { protect } from "./middleware/authMiddleware.js";



import Cleaning from "./models/Cleaning.js";
import Packing from "./models/Packing.js";
import Incoming from "./models/Incoming.js";
import Order from "./models/Order.js";


dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:3000","https://vatan-foods.vercel.app"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);


const startServer = async () => {
  await connectDB();  // <--- ❗ MUST BE AWAITED
  console.log("DB Connection complete → Loading routes...");

  app.use("/api/auth", authRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/incoming", incomingRoutes);
  app.use("/api/cleaning", cleaningRoutes);
  app.use("/api/packing", packingRoutes);
  app.use("/api/track-orders", trackOrderRoutes);
  app.use("/api/companies", companyRoutes);
  app.use("/api/",  protect,  reportRoutes);


  app.get("/", (req, res) => {
    res.send("Vatan Foods Backend is running...");
  });






// app.post("/summary", protect, async (req, res) => {
//   try {
//     let { startDate, endDate } = req.body;

//     // Date handling (default: last 1 month)
//     const end = endDate ? new Date(endDate) : new Date();
//     const start = startDate
//       ? new Date(startDate)
//       : new Date(new Date(end).setMonth(end.getMonth() - 1));

//     // =========================
//     // CLEANING AGGREGATION
//     // =========================
//     const cleaningAgg = await Cleaning.aggregate([
//       {
//         $match: { createdAt: { $gte: start, $lte: end } },
//       },
//       {
//         $group: {
//           _id: null,
//           totalCleanedKg: { $sum: "$outputQuantity" },
//           cleaningWastageKg: { $sum: "$wastageQuantity" },
//         },
//       },
//     ]);

//     // =========================
//     // PACKING AGGREGATION
//     // =========================
//     const packingAgg = await Packing.aggregate([
//       {
//         $match: { createdAt: { $gte: start, $lte: end } },
//       },
//       {
//         $group: {
//           _id: null,
//           totalPackedKg: { $sum: "$outputPacked" },
//           packingWastageKg: { $sum: "$wastage" },
//         },
//       },
//     ]);

//     // =========================
//     // VENDOR → STOCK
//     // =========================
//     const stockByVendor = await Incoming.aggregate([
//       {
//         $match: { createdAt: { $gte: start, $lte: end } },
//       },
//       {
//         $group: {
//           _id: "$vendorName",
//           stockReceivedKg: { $sum: "$totalQuantity" },
//         },
//       },
//       { $sort: { stockReceivedKg: -1 } },
//     ]);

//     // =========================
//     // VENDOR → SALES
//     // =========================
//     const salesByVendor = await Order.aggregate([
//       {
//         $match: { createdAt: { $gte: start, $lte: end } },
//       },
//       {
//         $group: {
//           _id: "$vendorName",
//           totalSalesAmount: { $sum: "$totalAmount" },
//           ordersCount: { $sum: 1 },
//         },
//       },
//       { $sort: { totalSalesAmount: -1 } },
//     ]);

//     // =========================
//     // FINAL RESPONSE
//     // =========================
//     res.json({
//       dateRange: { start, end },

//       production: {
//         totalCleanedKg: cleaningAgg[0]?.totalCleanedKg || 0,
//         totalPackedKg: packingAgg[0]?.totalPackedKg || 0,
//         totalWastageKg:
//           (cleaningAgg[0]?.cleaningWastageKg || 0) +
//           (packingAgg[0]?.packingWastageKg || 0),
//       },

//       vendors: {
//         stockByVendor,
//         salesByVendor,
//       },
//     });
//   } catch (err) {
//     console.error("Summary report error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });











  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();  // <--- RUN IT

export default app;
