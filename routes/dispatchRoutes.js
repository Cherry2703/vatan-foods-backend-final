// routes/dispatchRoutes.js
import express from "express";
import DispatchRecord from "../models/dispatchRecord.js";

const router = express.Router();
 
/* ✅ CREATE Dispatch */
router.post("/", async (req, res) => {
  try {
    const dispatchRecord = new DispatchRecord(req.body);
    await dispatchRecord.save();
    res.status(201).json({ message: "✅ Dispatch record created successfully", data: dispatchRecord });
  } catch (error) {
    console.error("❌ Error creating dispatch record:", error);
    res.status(400).json({ message: "❌ Error creating dispatch record", error: error.message });
  } 
});

/* 📋 READ All Dispatches */
router.get("/", async (req, res) => {
  try {
    const records = await DispatchRecord.find();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching dispatch records", error: error.message });
  }
});

/* 🔍 READ One Dispatch by UUID */
router.get("/:uuid", async (req, res) => {
  try {
    const record = await DispatchRecord.findOne({ dispatchUUID: req.params.uuid });
    if (!record) return res.status(404).json({ message: "❌ Dispatch record not found" });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching record", error: error.message });
  }
});

/* ✏️ UPDATE Dispatch (track changes in history) */
router.put("/:uuid", async (req, res) => {
  try {
    const existingRecord = await DispatchRecord.findOne({ dispatchUUID: req.params.uuid });
    if (!existingRecord) return res.status(404).json({ message: "❌ Dispatch record not found" });

    const oldData = existingRecord.toObject();
    Object.assign(existingRecord, req.body);

    existingRecord.history.push({
      changedAt: new Date(),
      changedBy: req.body.changedBy || "System",
      oldData,
      newData: req.body,
    });

    await existingRecord.save();
    res.status(200).json({ message: "✅ Dispatch record updated successfully", data: existingRecord });
  } catch (error) {
    res.status(400).json({ message: "❌ Error updating dispatch record", error: error.message });
  }
});

/* ❌ DELETE Dispatch */
router.delete("/:uuid", async (req, res) => {
  try {
    const deleted = await DispatchRecord.findOneAndDelete({ dispatchUUID: req.params.uuid });
    if (!deleted) return res.status(404).json({ message: "❌ Dispatch record not found" });
    res.status(200).json({ message: "✅ Dispatch record deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ message: "❌ Error deleting dispatch record", error: error.message });
  }
});

export default router;
