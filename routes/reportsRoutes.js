import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import Order from "../models/Order.js";
import Incoming from "../models/Incoming.js";
import Cleaning from "../models/Cleaning.js";
import Packing from "../models/Packing.js";
import User from "../models/User.js";

const app = express.Router();

/**
 * POST /api/reports/analytics
 * body: { startDate, endDate }
 */
app.post("/analytics", protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // ==============================
    // DATE NORMALIZATION
    // ==============================
    const start = startDate ? new Date(startDate) : new Date("1970-01-01");
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // ==============================
    // 1️⃣ EMPLOYEES
    // ==============================
    const employeeAgg = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    const employees = {
      total: 0,
      byRole: { admin: 0, manager: 0, operator: 0 }
    };

    employeeAgg.forEach(e => {
      employees.total += e.count;
      employees.byRole[e._id.toLowerCase()] = e.count;
    });

    // ==============================
    // 2️⃣ ORDERS + REVENUE
    // ==============================
    const ordersAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      }
    ]);

    const orders = {
      totalOrders: 0,
      statusBreakdown: {
        pending: 0,
        confirmed: 0,
        delivered: 0,
        cancelled: 0
      }
    };

    const revenue = {
      grossOrderValue: 0,
      deliveredRevenue: 0,
      pendingRevenue: 0,
      confirmedRevenue: 0,
      cancelledRevenue: 0,
      averageOrderValue: 0
    };

    ordersAgg.forEach(o => {
      const status = o._id.toLowerCase();
      orders.totalOrders += o.count;
      orders.statusBreakdown[status] = o.count;

      revenue.grossOrderValue += o.amount || 0;

      if (o._id === "Delivered") revenue.deliveredRevenue += o.amount || 0;
      if (o._id === "Pending") revenue.pendingRevenue += o.amount || 0;
      if (o._id === "Confirmed") revenue.confirmedRevenue += o.amount || 0;
      if (o._id === "Cancelled") revenue.cancelledRevenue += o.amount || 0;
    });

    revenue.averageOrderValue =
      orders.totalOrders > 0
        ? Math.round(revenue.grossOrderValue / orders.totalOrders)
        : 0;

    // ==============================
    // 3️⃣ INCOMING (PURCHASE)
    // ==============================
    const incomingAgg = await Incoming.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$vendorName",
          totalKg: { $sum: "$totalQuantity" },
          records: { $sum: 1 }
        }
      }
    ]);

    const incoming = {
      totalRecords: incomingAgg.reduce((s, v) => s + v.records, 0),
      vendorsInvolved: incomingAgg.length,
      totalIncomingKg: incomingAgg.reduce((s, v) => s + v.totalKg, 0)
    };

    // ==============================
    // 4️⃣ CLEANING
    // ==============================
    const cleaningAgg = await Cleaning.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$batchId",
          cleanedKg: { $sum: "$outputQuantity" },
          wastageKg: { $sum: "$wastageQuantity" },
          operators: { $addToSet: "$operator" }
        }
      }
    ]);

    const cleaning = {
      totalRecords: cleaningAgg.length,
      totalCleanedKg: cleaningAgg.reduce((s, c) => s + c.cleanedKg, 0),
      totalWastageKg: cleaningAgg.reduce((s, c) => s + c.wastageKg, 0)
    };

    // ==============================
    // 5️⃣ PACKING (ALL TIME / STATUS SAFE)
    // ==============================
    const packingAgg = await Packing.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          ongoing: {
            $sum: { $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0] }
          },
          packedKg: {
            $sum: {
              $cond: [{ $eq: ["$status", "Completed"] }, "$outputPacked", 0]
            }
          },
          wastageKg: {
            $sum: {
              $cond: [{ $eq: ["$status", "Completed"] }, "$wastage", 0]
            }
          }
        }
      }
    ]);

    const packingSummary = packingAgg[0] || {
      totalRecords: 0,
      completed: 0,
      pending: 0,
      ongoing: 0,
      packedKg: 0,
      wastageKg: 0
    };

    // ==============================
    // 6️⃣ BATCH-WISE PACKING
    // ==============================
    const packingBatchAgg = await Packing.aggregate([
  {
    $match: {
      batchId: { $exists: true }
    }
  },
  {
    $group: {
      _id: "$batchId",

      // Status handling
      status: { $last: "$status" },

      saleVendorName: { $last: "$vendorName" },

      // Count ALL records
      totalRecords: { $sum: 1 },

      // Only completed contribute to production
      packedKg: {
        $sum: {
          $cond: [{ $eq: ["$status", "Completed"] }, "$outputPacked", 0]
        }
      },
      packets: {
        $sum: {
          $cond: [{ $eq: ["$status", "Completed"] }, "$noOfPackets", 0]
        }
      },
      wastageKg: {
        $sum: {
          $cond: [{ $eq: ["$status", "Completed"] }, "$wastage", 0]
        }
      },

      workersArrays: { $push: { $ifNull: ["$workers", []] } },
      supervisor: { $last: "$managerId" }
    }
  },
  {
    $project: {
      status: 1,
      saleVendorName: 1,
      totalRecords: 1,
      packedKg: 1,
      packets: 1,
      wastageKg: 1,
      supervisor: 1,
      workers: {
        $reduce: {
          input: "$workersArrays",
          initialValue: [],
          in: { $setUnion: ["$$value", "$$this"] }
        }
      }
    }
  }
]);


    // ==============================
    // 7️⃣ BATCH PERFORMANCE
    // ==============================
    const batchWisePerformance = cleaningAgg.map(c => {
      const p = packingBatchAgg.find(b => b._id === c._id);
      const packedKg = p?.packedKg || 0;

      return {
        batchId: c._id,
        cleaning: c,
        packing: p || null,
        metrics: {
          batchEfficiencyPercent:
            c.cleanedKg > 0
              ? ((packedKg / c.cleanedKg) * 100).toFixed(2)
              : "0.00",
          totalWastageKg: c.wastageKg + (p?.wastageKg || 0)
        }
      };
    });

    // ==============================
    // 8️⃣ VENDOR ANALYTICS
    // ==============================
    const purchaseVendors = incomingAgg.map(v => ({
      vendorName: v._id,
      totalPurchasedKg: v.totalKg,
      records: v.records
    }));

    const saleVendorAgg = await Packing.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: "$vendorName",
          soldKg: { $sum: "$outputPacked" },
          packets: { $sum: "$noOfPackets" }
        }
      }
    ]);

    const totalSoldKg = saleVendorAgg.reduce((s, v) => s + v.soldKg, 0);

    const saleVendors = saleVendorAgg.map(v => ({
      saleVendorName: v._id,
      totalSoldKg: v.soldKg,
      totalPackets: v.packets,
      saleContributionPercent:
        totalSoldKg > 0
          ? ((v.soldKg / totalSoldKg) * 100).toFixed(2)
          : "0.00"
    }));

    // ==============================
    // FINAL RESPONSE
    // ==============================
    const response = {
      dateRange: { startDate, endDate },
      organisation: { employees },
      orders,
      operationsSummary: {
        incoming,
        cleaning,
        packing: {
          totalRecords: packingSummary.totalRecords,
          statusBreakdown: {
            completed: packingSummary.completed,
            pending: packingSummary.pending,
            ongoing: packingSummary.ongoing
          },
          totals: {
            packedKg: packingSummary.packedKg,
            wastageKg: packingSummary.wastageKg
          }
        }
      },
      batchWisePerformance,
      vendorAnalytics: {
        purchaseVendors,
        saleVendors
      }
    };

    // Revenue only for Admin
    if (req.user.role === "Admin") {
      response.revenue = revenue;
    }

    res.json(response);

  } catch (err) {
    console.error("❌ Analytics Error:", err);
    res.status(500).json({ message: "Failed to generate analytics" });
  }
});

export default app;
