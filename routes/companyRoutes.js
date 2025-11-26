// routes/companyRoutes.js
import express from "express";
import Company from "../models/Company.js";
import { protect } from "../middleware/authMiddleware.js"; // your auth middleware

const router = express.Router();

// Middleware to check admin role
function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
}

// ------------------ CRUD Routes ------------------

// CREATE company
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const company = new Company({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// READ all companies
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ single company by ID
router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE company
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    Object.assign(company, req.body, { updatedBy: req.user._id });
    await company.save();
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE company
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    await company.deleteOne();
    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
