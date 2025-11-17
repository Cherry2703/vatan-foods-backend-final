import express from "express";
import { v4 as uuidv4 } from "uuid";
import CleaningRecord from "../models/cleaningModel.js";
import IncomingMaterial from "../models/incomingModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Create Cleaning Record
 */
// router.post("/", protect, async (req, res) => {
//   try {
//     const { batchId, inputQuantity, outputQuantity } = req.body;

//     // 🧩 Validate that batchId exists in incoming materials
//     const incomingBatch = await IncomingMaterial.findOne({ batchId });
//     if (!incomingBatch) {
//       return res.status(404).json({ message: "Invalid batchId: Incoming record not found" });
//     }

//     // 🟩 Find the last cleaning record for this batch to calculate next cycle
//     const lastCycle = await CleaningRecord.findOne({ batchId }).sort({ cycleNumber: -1 }).exec();

//     const nextCycleNumber =
//       lastCycle && !isNaN(lastCycle.cycleNumber) ? lastCycle.cycleNumber + 1 : 1;

//     // 🧮 Auto-calculate wastage
//     const wastageQuantity = inputQuantity - outputQuantity;

//     const newRecord = new CleaningRecord({
//       ...req.body,
//       cleaningId: uuidv4(),
//       cycleNumber: nextCycleNumber,
//       previousOutput: lastCycle ? lastCycle.outputQuantity : inputQuantity,
//       wastageQuantity,
//       createdBy: req.user._id,
//     });

//     const saved = await newRecord.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(500).json({
//       message: "Error creating cleaning record",
//       error: err.message,
//     });
//   }
// });




router.post("/", protect, async (req, res) => {
  try {
    const { batchId, inputQuantity, outputQuantity } = req.body;

    // 🧩 Check incoming material
    const incoming = await IncomingMaterial.findOne({ batchId });
    if (!incoming) {
      return res.status(404).json({ message: "Invalid batchId" });
    }

    // 🟩 Validate input ≤ available stock
    if (inputQuantity > incoming.totalQuantity) {
      return res.status(400).json({
        message: `Input exceeds available stock. Available: ${incoming.totalQuantity} ${incoming.unit}`,
      });
    }

    // 🟦 Remaining Stock
    const remainingAfterCleaning = incoming.totalQuantity - inputQuantity;

    // 🟩 Previous cycle
    const lastCycle = await CleaningRecord.findOne({ batchId })
      .sort({ cycleNumber: -1 });

    const nextCycle = lastCycle ? lastCycle.cycleNumber + 1 : 1;

    // 🧮 Auto wastage
    const wastage = inputQuantity - outputQuantity;

    // 🟩 Create Cleaning Record
    const newRecord = new CleaningRecord({
      ...req.body,
      cleaningId: uuidv4(),
      cycleNumber: nextCycle,
      previousOutput: lastCycle ? lastCycle.outputQuantity : inputQuantity,
      wastageQuantity: wastage,
      usedQuantity: inputQuantity,
      remainingAfterCleaning,
      createdBy: req.user._id,
    });

    const saved = await newRecord.save();

    // 🟥 UPDATE IncomingMaterial Stock
    incoming.totalQuantity = remainingAfterCleaning;
    await incoming.save();

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      message: "Error creating cleaning record",
      error: err.message,
    });
  }
});


/**
 * ✅ Get All Cleaning Records (optionally filter by batchId)
 */
router.get("/", protect, async (req, res) => {
  try {
    const { batchId } = req.query;
    const filter = batchId ? { batchId } : {};
    const records = await CleaningRecord.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cleaning records", error: err.message });
  }
});

/**
 * ✅ Get Single Cleaning Record by ID
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const record = await CleaningRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Error fetching record", error: err.message });
  }
});

/**
 * ✅ Update Cleaning Record
 */
router.put("/:id", protect, async (req, res) => {
  try {
    // Recalculate wastage if quantities are updated
    const updateData = { ...req.body };
    if (req.body.inputQuantity && req.body.outputQuantity) {
      updateData.wastageQuantity = req.body.inputQuantity - req.body.outputQuantity;
    }

    const updated = await CleaningRecord.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Record not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating record", error: err.message });
  }
});

/**
 * ✅ Delete Cleaning Record
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await CleaningRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting record", error: err.message });
  }
});

export default router;
