// models/Company.js
import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "VatanFoods",
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      default: "VATANFOODS-REG-001",
    },
    email: {
      type: String,
      required: true,
      default: "vatanfoods1200@gmail.com",
    },
    phoneNumbers: {
      type: [String],
      default: ["+91-9876543210"],
    },
    address: {
      street: { type: String, default: "Hyderabad Road" },
      city: { type: String, default: "Hyderabad" },
      state: { type: String, default: "Telangana" },
      country: { type: String, default: "India" },
      zipCode: { type: String, default: "500001" },
    },
    financials: {
      gstNumber: { type: String, default: "GSTXXXXX1234" },
      panNumber: { type: String, default: "ABCDE1234F" },
      bankName: { type: String, default: "HDFC Bank" },
      accountNumber: { type: String, default: "1234567890" },
      ifscCode: { type: String, default: "HDFC0001234" },
    },
    branches: [
      {
        name: { type: String, default: "Main Branch" },
        address: {
          street: { type: String, default: "Hyderabad Road" },
          city: { type: String, default: "Hyderabad" },
          state: { type: String, default: "Telangana" },
          country: { type: String, default: "India" },
          zipCode: { type: String, default: "500001" },
        },
      },
    ],
    industry: {
      type: String,
      default: "Food Processing",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    createdBy: {
      type: String,
      default: "System",
    },
    updatedBy: {
      type: String,
      default: "System",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", CompanySchema);
