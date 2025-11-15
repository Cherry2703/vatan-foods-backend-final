import express from "express";
import IncomingMaterial from "../models/incomingModel.js";
import { protect } from "../middleware/authMiddleware.js";
import { generateBatchId } from "../utils/generateBatchId.js";

const router = express.Router();

// ✅ Create Incoming Material
router.post("/", protect, async (req, res) => {
  try {
    const batchId = await generateBatchId();
    const newIncoming = new IncomingMaterial({
      ...req.body,
      batchId,
      createdBy: req.user._id,
    });
    const saved = await newIncoming.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating incoming record", error: err.message });
  }
});

// ✅ Get All Incoming Materials
router.get("/", protect, async (req, res) => {
  try {
    const incoming = await IncomingMaterial.find().populate("createdBy", "name email");
    res.json(incoming);
  } catch (err) {
    res.status(500).json({ message: "Error fetching records", error: err.message });
  }
});

// ✅ Get Single Incoming Material
router.get("/:id", protect, async (req, res) => {
  try {
    const record = await IncomingMaterial.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Error fetching record", error: err.message });
  }
});

// ✅ Update Incoming Material
router.put("/:id", protect, async (req, res) => {
  try {
    const updated = await IncomingMaterial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Record not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating record", error: err.message });
  }
});

// ✅ Delete Incoming Material
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await IncomingMaterial.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting record", error: err.message });
  }
});

export default router;
