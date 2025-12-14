import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};


// router.post("/register", async (req, res) => {
//   const { name, email, password, role } = req.body;

//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists)
//       return res.status(400).json({ message: "User already exists" });

//     const user = await User.create({ name, email, password, role });

//     res.status(201).json({
//       uuid: user.uuid,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });


router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,

      // Optional profile fields
      role,
      mobile,
      department,
      designation,
      address,
      state,
      country,
      profilePic,
      DOB,
      gender,
      emergencyContact,
      joinedDate,
      employmentType,
      shiftTiming,
    } = req.body;

    // 🔒 Required field validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // 🔒 Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 🔒 Role protection (prevent random Admin creation)
    const allowedRoles = ["Admin", "Manager", "Operator"];
    const safeRole = allowedRoles.includes(role) ? role : "Operator";

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,

      mobile,
      department,
      designation,
      address,
      state,
      country,
      profilePic,
      DOB,
      gender,
      emergencyContact,
      joinedDate,
      employmentType,
      shiftTiming,
    });

    // ✅ Response (never send password)
    res.status(201).json({
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.status(200).json({
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// ✅ Get all employees (exclude admins)
router.get("/employees", protect, async (req, res) => {
  try {
    // Fetch all users except those with role "Admin"
    const employees = await User.find({});
    //   { role: { $ne: "Admin" } }, 
    //   "-password" 
    // ).sort({ createdAt: -1 }); 

    // Return employees list
    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});


export default router;
