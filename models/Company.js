// models/Company.js
import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    website: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumbers: {
      type: [String], // can store multiple numbers
      default: [],
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
    financials: {
      gstNumber: { type: String },
      panNumber: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
    },
    employees: {
      type: Number,
      default: 0,
    },
    branches: [
      {
        name: String,
        address: {
          street: String,
          city: String,
          state: String,
          country: String,
          zipCode: String,
        },
      },
    ],
    industry: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    createdBy: {
      type: String, // store user ID who created the company
    },
    updatedBy: {
      type: String, // store user ID who last updated
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", CompanySchema);
