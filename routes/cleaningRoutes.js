import express from "express";
import { v4 as uuidv4 } from "uuid";
import Cleaning from "../models/Cleaning.js";
import { protect } from "../middleware/authMiddleware.js";
import History from "../models/History.js";

const router = express.Router();

async function saveHistory(batchId, model, action, data, updatedBy) {
  await History.create({ batchId, model, action, data, updatedBy });
}

// Create
router.post("/", protect, async (req, res) => {
  try {
    req.body.cleaningId = uuidv4();
    req.body.createdBy = req.user.name || req.user.id;
    const clean = await Cleaning.create(req.body);
    await saveHistory(clean.batchId, "Cleaning", "CREATE", clean, req.user.name);
    res.json(clean);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all
router.get("/", protect, async (req, res) => {
  const data = await Cleaning.find({});
  res.json(data);
});

// Get single
router.get("/:cleaningId", protect, async (req, res) => {
  const data = await Cleaning.findOne({ cleaningId: req.params.cleaningId });
  res.json(data);
});

// Update
router.put("/:cleaningId", protect, async (req, res) => {
  try {
    const previous = await Cleaning.findOne({ cleaningId: req.params.cleaningId });
    const updated = await Cleaning.findOneAndUpdate(
      { cleaningId: req.params.cleaningId },
      req.body,
      { new: true }
    );
    await saveHistory(updated.batchId, "Cleaning", "UPDATE", { previous, updated }, req.user.name);
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete
router.delete("/:cleaningId", protect, async (req, res) => {
  try {
    const deleted = await Cleaning.findOneAndDelete({ cleaningId: req.params.cleaningId });
    await saveHistory(req.params.cleaningId, "Cleaning", "DELETE", deleted, req.user.name);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
