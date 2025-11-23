import express from "express";
import History from "../models/History.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect,async (req, res) => {
  try {
    const records = await History.find({}).sort({ createdAt: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No history found" });
    }

    const incoming = records.filter(rec => rec.model === "Incoming");
    const cleaning = records.filter(rec => rec.model === "Cleaning");
    const packing = records.filter(rec => rec.model === "Packing");
    const orders = records.filter(rec => rec.model === "Order");

    res.status(200).json({
      message: "History fetched successfully",
      total: records.length,
      incoming,
      cleaning,
      packing,
      orders,
    });

  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ error: "Server error", details: err });
  }
});

export default router;
