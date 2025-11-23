import express from "express";
import { v4 as uuidv4 } from "uuid";
import Cleaning from "../models/Cleaning.js";
import Incoming from "../models/Incoming.js";
import { protect } from "../middleware/authMiddleware.js";
import History from "../models/History.js";

const app = express.Router();

//--------------------------------------------------
async function saveHistory(batchId, model, action, data, updatedBy) {
  await History.create({ batchId, model, action, data, updatedBy });
}

// Cleaning ------------------------------------------------------------
app.post("/", protect, async (req, res) => {
  try {
    const clean = await Cleaning.create(req.body);
    await saveHistory(clean.batchId, "Cleaning", "CREATE", clean, req.user.name);
    res.json(clean);
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/", protect, async (req, res) => {
  const data = await Cleaning.find({});
  res.json(data);
});

app.get("/:cleaningId",protect, async (req, res) => {
  const data = await Cleaning.findOne({ cleaningId: req.params.cleaningId });
  res.json(data);
});

app.put("/:id", protect, async (req, res) => {
  try {
    const previous = await Cleaning.findOne({cleaningId:req.params.id});
    //const updated = await Cleaning.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const updated = await Cleaning.findOneAndUpdate(
      { cleaningId: req.params.id },
      req.body,
      { new: true }
    );

    await saveHistory(updated.batchId, "Cleaning", "UPDATE", { previous, updated }, req.user.name);
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});


app.delete("/:cleaningId", protect, async (req, res) => {
  try {
    const deleted = await Cleaning.findOneAndDelete({ cleaningId: req.params.cleaningId });
    await saveHistory(req.params.cleaningId, "Cleaning", "DELETE", deleted, req.user.name);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});



export default app;