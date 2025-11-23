// routes/orders.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import Order from "../models/Order.js";  // adjust path to your model
import {protect} from "../middleware/authMiddleware.js"; // adjust path
import History from "../models/History.js";

const app = express.Router();


//--------------------------------------------------
async function saveHistory(batchId, model, action, data, updatedBy) {
  await History.create({ batchId, model, action, data, updatedBy });
}




// POST: Create Order
app.post("/", protect, async (req, res) => {
  try {
    let {
      customerName,
      customerType,
      contactPerson,
      contactNumber,
      email,
      items,
      orderedDate,
      orderStatus,
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
      totalAmount,
      poNumber,
      vendorName,
      vendorAddress,
      vendorGSTIN
    } = req.body;

    // Parse items if stringified JSON
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (err) {
        return res.status(400).json({ message: "❌ Invalid items JSON." });
      }
    }

    // Must be array
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "❌ Order must include at least one item." });
    }

    // Sanitize items
    const sanitizedItems = items.map((it) => ({
      name: it.name || "",
      quantity: Number(it.quantity) || 0,
      unit: it.unit || "",
      pricePerUnit: Number(it.pricePerUnit) || 0,
      eachUnitWeight: Number(it.eachUnitWeight) || 0   
    }));


    // Compute amount server-side
    const computedTotal = sanitizedItems.reduce(
      (sum, it) => sum + it.quantity * it.pricePerUnit,
      0
    );

    // Create order
    const newOrder = await Order.create({
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
      orderedDate: orderedDate || null,

      poNumber: poNumber || "",
      vendorName: vendorName || "",
      vendorAddress: vendorAddress || "",
      vendorGSTIN: vendorGSTIN || "",

      createdBy: req.user?._id || req.user?.id || null,
      updatedBy: req.user?._id || req.user?.id || null,
    });

    // Save to audit history
    await saveHistory(
      newOrder.orderId,
      "Order",
      "CREATE",
      newOrder,
      req.user?.name || "System"
    );

    return res.status(201).json({
      message: "✅ Order created successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    return res.status(500).json({
      message: "❌ Internal server error",
      error: err.message,
    });
  }
});












// GET ALL ORDERS
app.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET SINGLE ORDER BY orderId
app.get("/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    res.json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});



// app.put("/:orderId", protect, async (req, res) => {
//   try {
//     const previous = await Order.findOne({ orderId: req.params.orderId });

//     const updated = await Order.findOneAndUpdate(
//       { orderId: req.params.orderId },
//       req.body,
//       { new: true, runValidators: true }   // ✅ Added runValidators
//     );

//     await saveHistory(
//       updated.orderId,
//       "Order",
//       "UPDATE",
//       { previous, updated },
//       req.user?.name || "System"
//     );

//     res.json(updated);
//   } catch (err) {
//     console.error("UPDATE ERROR:", err);
//     res.status(500).json(err);
//   }
// });



// DELETE ORDER



app.put("/:orderId", protect, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // 1️⃣ Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "❌ Request body cannot be empty"
      });
    }

    // 2️⃣ Find previous order
    const previous = await Order.findOne({ orderId });

    if (!previous) {
      return res.status(404).json({
        message: "❌ Order not found",
        orderId
      });
    }

    // 3️⃣ Update order
    const updated = await Order.findOneAndUpdate(
      { orderId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(500).json({
        message: "❌ Failed to update order"
      });
    }

    // 4️⃣ Log history
    await saveHistory(
      updated.orderId,
      "Order",
      "UPDATE",
      { previous, updated },
      req.user?.name || "System"
    );

    // 5️⃣ Return updated order
    return res.json({
      message: "✅ Order updated successfully",
      order: updated
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return res.status(500).json({
      message: "❌ Internal server error",
      error: err.message
    });
  }
});


app.delete("/:orderId", protect, async (req, res) => {
  try {
    const deleted = await Order.findOneAndDelete({
      orderId: req.params.orderId,
    });

    await saveHistory(
      req.params.orderId,
      "Order",
      "DELETE",
      deleted,
      req.user?.name || "System"
    );

    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});


export default app;
