import express from "express";
import Incoming from "../models/Incoming.js";
import { protect } from "../middleware/authMiddleware.js";
import { generateBatchId } from "../utils/generateBatchId.js";
import History from "../models/History.js";

const app = express.Router();


//--------------------------------------------------
async function saveHistory(batchId, model, action, data, updatedBy) {
  await History.create({ batchId, model, action, data, updatedBy });
}


//--------------------------------------------------
// CRUD ROUTES
//--------------------------------------------------

// Incoming ------------------------------------------------------------
app.post("/", protect, async (req, res) => {
  try {
    const incoming = await Incoming.create(req.body);
    await saveHistory(incoming.batchId, "Incoming", "CREATE", incoming, req.user.name);
    res.json(incoming);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/", protect, async (req, res) => {
  const data = await Incoming.find({});
  res.json(data);
});

app.get("/:batchId",protect, async (req, res) => {
  const data = await Incoming.findOne({ batchId: req.params.batchId });
  res.json(data);
});

// app.put("/:incomingId", protect, async (req, res) => {
//   try {    
//     const previous = await Incoming.findOne({ incomingId: req.params.incomingId });
//     const updated = await Incoming.findOneAndUpdate(
//       { batchId: req.params.incomingId },
//       req.body,
//       { new: true }
//     );

//     await saveHistory(updated.batchId, "Incoming", "UPDATE", { previous, updated }, req.user.name);
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });




app.put("/:batchId", protect, async (req, res) => {
  try {
    const previous = await Incoming.findOne({ batchId: req.params.batchId });

    if (!previous) {
      return res.status(404).json({ message: "Incoming material not found" });
    }

    // Update using incomingId
    const updated = await Incoming.findOneAndUpdate(
      { batchId: req.params.batchId },
      req.body,
      { new: true }
    );

    await saveHistory(
      updated.batchId,
      "Incoming",
      "UPDATE",
      { previous, updated },
      req.user.name
    );

    res.json(updated);
  } catch (err) {
    console.error("PUT /incoming/:incomingId error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


app.delete("/:incomingId", protect, async (req, res) => {
  try {
    // Find and delete by incomingId
    const deleted = await Incoming.findOneAndDelete({ incomingId: req.params.incomingId });

    if (!deleted) {
      return res.status(404).json({ message: "Incoming material not found" });
    }

    // Save history
    await saveHistory(deleted.batchId, "Incoming", "DELETE", deleted, req.user.name);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE /incoming/:incomingId error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


export default app;