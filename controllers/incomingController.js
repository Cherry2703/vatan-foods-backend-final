import Incoming from "../models/incomingModel.js";

// CREATE
export const createIncoming = async (req, res) => {
  try {
    const incoming = await Incoming.create(req.body);
    res.status(201).json(incoming);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ALL
export const getAllIncoming = async (req, res) => {
  try {
    const data = await Incoming.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ONE
export const getIncomingById = async (req, res) => {
  try {
    const data = await Incoming.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateIncoming = async (req, res) => {
  try {
    const updated = await Incoming.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteIncoming = async (req, res) => {
  try {
    await Incoming.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
