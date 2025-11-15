import express from "express";
import { v4 as uuidv4 } from "uuid";
import PackingRecord from "../models/packingModel.js";
import CleaningRecord from "../models/cleaningModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// ✅ Create Packing Record
router.post("/", protect, async (req, res) => {
  try {
    const {
      batchId,
      cleaningId,
      shift,
      packingType,
      inputFromRaw,
      inputFromCleaning,
      outputPacked,
      numberOfBags,
      bagWeight,
      wastage,
      workers,
      managerId,
      status,
      pendingReason,
      remarks,
    } = req.body;

    // 🧩 Check cleaningId validity only if provided
    let cleaningRecord = null;
    if (cleaningId) {
      cleaningRecord = await CleaningRecord.findOne({ cleaningId });
      if (!cleaningRecord) {
        console.warn(`⚠️ Cleaning ID not found: ${cleaningId}. Proceeding as raw material.`);
      }
    }

    // 🧠 Smart validation for pendingReason
    let validatedPendingReason = pendingReason;
    if (status === "Completed") {
      validatedPendingReason = null; // clear if completed
    } else if ((status === "Pending" || status === "Ongoing") && !pendingReason) {
      return res.status(400).json({
        message: "❌ pendingReason is required when status is Pending or Ongoing.",
      });
    }

    const newRecord = new PackingRecord({
      packingId: uuidv4(),
      batchId,
      cleaningId: cleaningId || null,
      shift,
      packingType,
      inputFromRaw,
      inputFromCleaning,
      outputPacked,
      numberOfBags,
      bagWeight,
      wastage,
      workers,
      managerId,
      status,
      pendingReason: validatedPendingReason,
      remarks,
    });

    const saved = await newRecord.save();
    res.status(201).json({ message: "✅ Packing record created successfully.", record: saved });
  } catch (err) {
    console.error("❌ Error creating packing record:", err);
    res.status(500).json({ message: "❌ Error creating packing record.", error: err.message });
  }
});


// ✅ Get All Packing Records
router.get("/", protect, async (req, res) => {
  try {
    const records = await PackingRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching packing records", error: err.message });
  }
});


// ✅ Get Packing Record by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const record = await PackingRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Error fetching record", error: err.message });
  }
});


router.put("/:id", protect, async (req, res) => {
  try {
    const existing = await PackingRecord.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "❌ Packing record not found." });
    }

    // Log previous data before update
    existing.history.push({
      updatedBy: req.user?.id || "system",
      previousData: existing.toObject(),
    });

    // Update record
    Object.assign(existing, req.body);
    const updated = await existing.save();

    res.json({
      message: "✅ Packing record updated successfully with history log.",
      updatedRecord: updated,
    });
  } catch (err) {
    console.error("Error updating packing record:", err);
    res.status(500).json({
      message: "❌ Error updating packing record.",
      error: err.message,
    });
  }
});



// ✅ Delete Packing Record
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await PackingRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "🗑️ Packing record deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting record", error: err.message });
  }
});

export default router;
