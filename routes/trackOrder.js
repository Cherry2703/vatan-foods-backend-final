import express from "express";
import History from "../models/History.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET HISTORY BY BATCHID
router.get("/", protect, async (req, res) => {
  try {
    const { batchId } = req.query;

    if (!batchId) {
      return res.status(400).json({ message: "batchId is required" });
    }

    // Get only required models and matching batchId
    const records = await History.find({
      batchId,
      model: { $in: ["Incoming", "Cleaning", "Packing"] },
    }).sort({ createdAt: 1 }); // timeline order: oldest → newest

    if (!records || records.length === 0) {
      return res.status(404).json({
        message: "No history found for this batchId",
        batchId,
      });
    }

    // Grouping
    const incoming = records.filter((rec) => rec.model === "Incoming");
    const cleaning = records.filter((rec) => rec.model === "Cleaning");
    const packing = records.filter((rec) => rec.model === "Packing");

    res.status(200).json({
      message: "History fetched successfully",
      batchId,
      total: records.length,
      incoming,
      cleaning,
      packing,
    });
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ error: "Server error", details: err });
  }
});

export default router;
