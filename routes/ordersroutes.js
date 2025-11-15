import express from "express";
import { v4 as uuidv4 } from "uuid";
import Order from "../models/ordersModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router(); 

/**
 * ✅ Create a new order
 */
router.post("/", protect, async (req, res) => {
  try {
    const {
      customerName,
      customerType,
      contactPerson,
      contactNumber,
      email,
      items,
      orderStatus,
      totalAmount,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryPincode,
      deliveryDate,
      deliveryTimeSlot,
      assignedVehicle,
      driverName,
      driverContact,
      warehouseLocation,
      poDate,
      remarks,
    } = req.body;

    console.log(poDate); 
     

    // 🧠 Basic validations
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "❌ Order must include at least one item." });
    }

    // Calculate total amount if not provided
    const computedTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.pricePerUnit,
      0
    );

    const newOrder = new Order({
      orderId: uuidv4(),
      customerName,
      customerType,
      contactPerson,
      contactNumber,
      email,
      items,
      orderStatus: orderStatus || "Pending",
      totalAmount: totalAmount || computedTotal,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryPincode,
      deliveryDate,
      deliveryTimeSlot,
      assignedVehicle,
      driverName,
      driverContact,
      warehouseLocation,
      remarks,
      orderedDate:poDate,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: "✅ Order created successfully.",
      order: savedOrder,
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({
      message: "❌ Error creating order.",
      error: err.message,
    });
  }
});

// -----------------------need to upgrade this route for pdf as well-----------------------

// import express from "express";
// import { v4 as uuidv4 } from "uuid";
// import multer from "multer";
// import fs from "fs";
// import Order from "../models/ordersModel.js";
// import { protect } from "../middleware/authMiddleware.js";
// import cloudinary from "../utils/cloudinary.js";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" }); // Temporary storage before Cloudinary

// /**
//  * ✅ Create a new order (with optional PDF upload)
//  */
// router.post("/", protect, upload.single("orderPdf"), async (req, res) => {
//   try {
//     const {
//       customerName,
//       customerType,
//       contactPerson,
//       contactNumber,
//       email,
//       items,
//       totalAmount,
//       deliveryAddress,
//       deliveryCity,
//       deliveryState,
//       deliveryPincode,
//       deliveryDate,
//       deliveryTimeSlot,
//       assignedVehicle,
//       driverName,
//       driverContact,
//       warehouseLocation,
//       remarks,
//       vendorName,
//       vendorGSTIN,
//       vendorAddress,
//       poNumber,
//       poDate,
//       subTotal,
//       gstAmount,
//     } = req.body;

//     // 🧠 Validate essential fields
//     if (!customerName || !items) {
//       return res
//         .status(400)
//         .json({ message: "❌ Missing required fields (customerName, items)" });
//     }

//     // 📦 1️⃣ Upload PDF to Cloudinary (if provided)
//     let pdfUrl = "";
//     let pdfPublicId = "";

//     if (req.file) {
//       const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//         folder: "orders_pdfs",
//         resource_type: "raw",
//       });

//       pdfUrl = uploadResult.secure_url;
//       pdfPublicId = uploadResult.public_id;

//       // delete local temp file
//       fs.unlinkSync(req.file.path);
//     }

//     // 📦 2️⃣ Compute total if not provided
//     const parsedItems = JSON.parse(items);
//     const computedTotal = parsedItems.reduce(
//       (sum, item) => sum + item.quantity * item.pricePerUnit,
//       0
//     );

//     // 📦 3️⃣ Save order with Cloudinary URL
//     const newOrder = new Order({
//       orderId: uuidv4(),
//       customerName,
//       customerType,
//       contactPerson,
//       contactNumber,
//       email,
//       vendorName,
//       vendorGSTIN,
//       vendorAddress,
//       poNumber,
//       poDate,
//       items: parsedItems,
//       subTotal: subTotal || computedTotal,
//       gstAmount,
//       totalAmount: totalAmount || computedTotal,
//       deliveryAddress,
//       deliveryCity,
//       deliveryState,
//       deliveryPincode,
//       deliveryDate,
//       deliveryTimeSlot,
//       assignedVehicle,
//       driverName,
//       driverContact,
//       warehouseLocation,
//       remarks,
//       pdfUrl,
//       pdfPublicId,
//       orderSource: req.file ? "PDF" : "Manual",
//       createdBy: req.user?.id,
//       updatedBy: req.user?.id,
//     });

//     const savedOrder = await newOrder.save();

//     res.status(201).json({
//       message: "✅ Order created successfully with PDF upload.",
//       order: savedOrder,
//     });
//   } catch (err) {
//     console.error("❌ Error creating order:", err);
//     res.status(500).json({
//       message: "❌ Error creating order.",
//       error: err.message,
//     });
//   }
// });

// export default router;















/**
 * ✅ Get all orders
 */
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

/**
 * ✅ Get order by ID
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
});

/**
 * ✅ Update order (with audit logging)
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ message: "❌ Order not found." });
    }

    // Store previous state for traceability
    if (!existingOrder.history) existingOrder.history = [];
    existingOrder.history.push({
      updatedBy: req.user?.id || "system",
      previousData: existingOrder.toObject(),
      updatedAt: new Date(),
    });

    Object.assign(existingOrder, req.body, { updatedBy: req.user?.id });
    const updatedOrder = await existingOrder.save();

    res.json({
      message: "✅ Order updated successfully with change log.",
      updatedOrder,
    });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({
      message: "❌ Error updating order.",
      error: err.message,
    });
  }
});

/**
 * ✅ Update delivery status only (for logistics updates)
 */
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status, paymentStatus, dispatchDate, receivedBy, deliveryProofUrl } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status || order.status;
    order.paymentStatus = paymentStatus || order.paymentStatus;
    order.dispatchDate = dispatchDate || order.dispatchDate;
    order.receivedBy = receivedBy || order.receivedBy;
    order.deliveryProofUrl = deliveryProofUrl || order.deliveryProofUrl;
    order.updatedBy = req.user?.id;

    await order.save();
    res.json({ message: "✅ Order status updated successfully.", order });
  } catch (err) {
    res.status(500).json({ message: "Error updating order status", error: err.message });
  }
});

/**
 * ✅ Delete order
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "🗑️ Order deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting order", error: err.message });
  }
});

export default router;
