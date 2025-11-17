// routes/orders.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import Order from "../models/ordersModel.js"; // adjust path to your model
import {protect} from "../middleware/authMiddleware.js"; // adjust path

const router = express.Router();

// GET all orders
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    return res.status(500).json({ message: "❌ Error fetching orders.", error: err.message });
  }
});

// POST create order
router.post("/", protect, async (req, res) => {
  try {
    // Accept items as array or JSON string (frontend now sends array)
    let {
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
      poNumber,
      vendorName,
      vendorAddress,
      vendorGSTIN,
    } = req.body;

    // parse items if string
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (parseErr) {
        return res.status(400).json({ message: "❌ Could not parse items JSON." });
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "❌ Order must include at least one item." });
    }

    // sanitize items and ensure numbers
    const sanitizedItems = items.map((it) => ({
      name: it.name || "",
      quantity: Number(it.quantity) || 0,
      unit: it.unit || "",
      pricePerUnit: Number(it.pricePerUnit) || 0,
      batchNo: it.batchNo || "",
    }));

    // compute total server-side for safety
    const computedTotal = sanitizedItems.reduce((sum, it) => sum + it.quantity * it.pricePerUnit, 0);

    const newOrder = new Order({
      orderId: uuidv4(),
      customerName: customerName || "",
      customerType: customerType || "Retail",
      contactPerson: contactPerson || "",
      contactNumber: contactNumber || "",
      email: email || "",
      items: sanitizedItems,
      orderStatus: orderStatus || "Pending",
      totalAmount: typeof totalAmount === "number" ? totalAmount : computedTotal,
      deliveryAddress: deliveryAddress || "",
      deliveryCity: deliveryCity || "",
      deliveryState: deliveryState || "",
      deliveryPincode: deliveryPincode || "",
      deliveryDate: deliveryDate || null,
      deliveryTimeSlot: deliveryTimeSlot || "",
      assignedVehicle: assignedVehicle || "",
      driverName: driverName || "",
      driverContact: driverContact || "",
      warehouseLocation: warehouseLocation || "",
      remarks: remarks || "",
      orderedDate: poDate || null,
      poNumber: poNumber || "",
      vendorName: vendorName || "",
      vendorAddress: vendorAddress || "",
      vendorGSTIN: vendorGSTIN || "",
      createdBy: req.user?.id || req.user?._id || null,
      updatedBy: req.user?.id || req.user?._id || null,
    });

    const savedOrder = await newOrder.save();
    return res.status(201).json({ message: "✅ Order created successfully.", order: savedOrder });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    return res.status(500).json({ message: "❌ Error creating order.", error: err.message });
  }
});

// PUT update order
router.put("/:id", protect, async (req, res) => {
  try {
    const orderId = req.params.id;
    let update = { ...req.body };

    // parse items if needed
    if (typeof update.items === "string") {
      try {
        update.items = JSON.parse(update.items);
      } catch {
        return res.status(400).json({ message: "❌ Could not parse items JSON." });
      }
    }

    if (Array.isArray(update.items)) {
      update.items = update.items.map((it) => ({
        name: it.name || "",
        quantity: Number(it.quantity) || 0,
        unit: it.unit || "",
        pricePerUnit: Number(it.pricePerUnit) || 0,
        batchNo: it.batchNo || "",
      }));
      const computedTotal = update.items.reduce((sum, it) => sum + it.quantity * it.pricePerUnit, 0);
      update.totalAmount = typeof update.totalAmount === "number" ? update.totalAmount : computedTotal;
    }

    update.updatedBy = req.user?.id || req.user?._id || null;
    update.updatedAt = new Date();

    const updated = await Order.findByIdAndUpdate(orderId, update, { new: true });
    if (!updated) return res.status(404).json({ message: "❌ Order not found." });

    return res.status(200).json({ message: "✅ Order updated.", order: updated });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    return res.status(500).json({ message: "❌ Error updating order.", error: err.message });
  }
});

// DELETE order
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "❌ Order not found." });
    return res.status(200).json({ message: "✅ Order deleted." });
  } catch (err) {
    console.error("❌ Error deleting order:", err);
    return res.status(500).json({ message: "❌ Error deleting order.", error: err.message });
  }
});

export default router;
