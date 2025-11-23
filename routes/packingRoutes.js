import express from "express";
import { v4 as uuidv4 } from "uuid";
import Packing from "../models/Packing.js";
import Cleaning from "../models/Cleaning.js";
import { protect } from "../middleware/authMiddleware.js";
import History from "../models/History.js";

const app = express.Router();


//--------------------------------------------------
async function saveHistory(batchId, model, action, data, updatedBy) {
  await History.create({ batchId, model, action, data, updatedBy });
}



// Packing ------------------------------------------------------------
app.post("/", protect, async (req, res) => {
  try {
    const pack = await Packing.create(req.body);
    await saveHistory(pack.batchId, "Packing", "CREATE", pack, req.user.name);
    res.json(pack);
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/", protect, async (req, res) => {
  const data = await Packing.find({});
  res.json(data);
});

app.get("/:packingId",protect, async (req, res) => {
  const data = await Packing.findOne({ packingId: req.params.packingId });
  res.json(data);
});

// app.put("/api/packing/:id", protect, async (req, res) => {
// try {
//     const previous = await Packing.findOne({_id:req.params.id});
//     //const updated = await Cleaning.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     const updated = await Packing.findOneAndUpdate(
//       { batchId: req.params.id },
//       req.body,
//       { new: true }
//     );

//     await saveHistory(updated.batchId, "Packing", "UPDATE", { previous, updated }, req.user.name);
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });



// PUT /api/packing/:id
app.put("/:id", protect, async (req, res) => {
  try {
    const packingId = req.params.id;

    // 1️⃣ Find previous record
    const previous = await Packing.findOne({ packingId });
    if (!previous) {
      return res.status(404).json({ message: "Packing record not found" });
    }

    // 2️⃣ Update using packingId (not _id)
    const updated = await Packing.findOneAndUpdate(
      { packingId },
      req.body,
      { new: true }
    );

    // 3️⃣ Save history
    await History.create({
      batchId: updated.batchId,
      model: "Packing",
      action: "UPDATE",
      data: { previous, updated },
      updatedBy: req.user.name,
    });

    res.json(updated);

  } catch (err) {
    console.error("PUT /api/packing/:id error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




// Delete packing entry
app.delete("/:packingId", protect, async (req, res) => {
  try {
    // 🔍 Find and delete using packingId (UUID), not MongoDB _id
    const deleted = await Packing.findOneAndDelete({
      packingId: req.params.packingId,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "❌ Packing record not found",
        packingId: req.params.packingId,
      });
    }

    // 🧾 Save to history
    await saveHistory(
      deleted.batchId,
      "Packing",
      "DELETE",
      deleted,
      req.user.name
    );

    res.json({ message: "✅ Packing record deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE /api/packing/:packingId error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});


export default app;