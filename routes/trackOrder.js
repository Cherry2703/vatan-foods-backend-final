// routes/trackOrder.js
import express from "express";
import Incoming from "../models/incomingModel.js";
import Cleaning from "../models/cleaningModel.js";
import Packing from "../models/packingModel.js";
import Dispatch from "../models/dispatchModel.js";
import Orders from "../models/ordersModel.js";

const router = express.Router();

/**
 * GET /api/batch/track/:batchId
 * Combines FULL history for a batch
 */
router.get("/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    // Find incoming stage (raw material)
    const incoming = await Incoming.findOne({ batchId });

    // Find cleaning stage
    const cleaning = await Cleaning.findOne({ batchId });

    // Find packing stage(s) — often more than one
    const packing = await Packing.find({ batchId });

    // Find dispatch info
    const dispatch = await Dispatch.findOne({ batchId });

    // Find ANY order that contains this batch
    const order = await Orders.findOne({ "items.batchId": batchId });

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

    res.status(200).json(trackingData);
  } catch (err) {
    console.error("❌ Error tracking batch:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
