const { Transaction, AssetLiability } = require("../models/financeModel");
const Employee = require("../models/employeeModel");
const Production = require("../models/ProductionModel");
const Inventory = require("../models/inventoryModel");
const Order = require("../models/orderModel");
const Customer = require("../models/customerModel");
const User = require("../models/userModel");

// Helper function to get date range based on period
const getDateRange = (period) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case "30days":
      startDate.setDate(now.getDate() - 30);
      break;
    case "6months":
      startDate.setMonth(now.getMonth() - 6);
      break;
    case "1year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "2years":
      startDate.setFullYear(now.getFullYear() - 2);
      break;
    case "5years":
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }
  
  return { startDate, endDate: now };
};

// Calculate previous period for comparison
const getPreviousPeriodRange = (currentStart, currentEnd) => {
  const duration = currentEnd - currentStart;
  const previousEnd = new Date(currentStart);
  const previousStart = new Date(currentStart.getTime() - duration);
  
  return { previousStart, previousEnd };
};

// Mock data generator
const getMockDashboardData = (period) => {
  const now = new Date();
  const { startDate } = getDateRange(period);
  
  return {
    success: true,
    period,
    dateRange: {
      start: startDate,
      end: now
    },
    financial: {
      netWorth: 12500000,
      totalAssets: 18750000,
      totalLiabilities: 6250000,
      revenue: 5420000,
      expenses: 3280000,
      netProfit: 2140000,
      revenueChange: 15.8,
      expenseChange: 8.2,
      profitChange: 28.5
    },
    employees: {
      total: 42,
      active: 38,
      onLeave: 4,
      totalPayroll: 2850000,
      change: 5.0
    },
    inventory: {
      totalValue: 2450000,
      totalItems: 156,
      lowStockItems: 12,
      stockHealthPercentage: "92.31"
    },
    production: {
      totalBatches: 48,
      completedBatches: 42,
      activeBatches: 6,
      totalYield: 8520,
      targetYield: 9000,
      yieldEfficiency: "94.67",
      change: 12.5
    },
    sales: {
      totalOrders: 128,
      completedOrders: 115,
      pendingOrders: 13,
      totalSales: 5420000,
      averageOrderValue: "42343.75",
      orderChange: 18.5,
      salesChange: 15.8
    },
    customers: {
      total: 89,
      new: 14
    },
    users: {
      total: 24,
      pending: 3
    },
    trends: {
      revenue: [
        { month: "2025-08", value: 1200000 },
        { month: "2025-09", value: 1580000 },
        { month: "2025-10", value: 2640000 }
      ]
    }
  };
};

// Get dashboard metrics
const getDashboardMetrics = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const isDbConnected = mongoose.connection.readyState === 1;
    
    // If database is not connected, return mock data
    if (!isDbConnected) {
      const period = req.query.period || "30days";
      return res.json(getMockDashboardData(period));
    }

    const period = req.query.period || "30days";
    const { startDate, endDate } = getDateRange(period);
    const { previousStart, previousEnd } = getPreviousPeriodRange(startDate, endDate);

    // Financial Metrics
    const currentIncome = await Transaction.aggregate([
      {
        $match: {
          type: "income",
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const previousIncome = await Transaction.aggregate([
      {
        $match: {
          type: "income",
          date: { $gte: previousStart, $lte: previousEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const currentExpenses = await Transaction.aggregate([
      {
        $match: {
          type: "expense",
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const previousExpenses = await Transaction.aggregate([
      {
        $match: {
          type: "expense",
          date: { $gte: previousStart, $lte: previousEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const totalIncome = currentIncome[0]?.total || 0;
    const prevIncome = previousIncome[0]?.total || 0;
    const totalExpenses = currentExpenses[0]?.total || 0;
    const prevExpenses = previousExpenses[0]?.total || 0;

    const netProfit = totalIncome - totalExpenses;
    const prevNetProfit = prevIncome - prevExpenses;

    // Calculate Net Worth (Assets - Liabilities)
    const assets = await AssetLiability.aggregate([
      {
        $match: {
          type: "asset",
          status: "active"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" }
        }
      }
    ]);

    const liabilities = await AssetLiability.aggregate([
      {
        $match: {
          type: "liability",
          status: "active"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" }
        }
      }
    ]);

    const totalAssets = assets[0]?.total || 0;
    const totalLiabilities = liabilities[0]?.total || 0;
    const netWorth = totalAssets - totalLiabilities;

    // Employee Metrics
    const activeEmployees = await Employee.countDocuments({ status: "active" });
    const onLeaveEmployees = await Employee.countDocuments({ status: "on-leave" });
    
    const currentEmployees = await Employee.countDocuments({
      status: "active",
      createdAt: { $lte: endDate }
    });
    
    const previousEmployees = await Employee.countDocuments({
      status: "active",
      createdAt: { $lte: previousEnd }
    });

    // Calculate total payroll
    const payroll = await Employee.aggregate([
      {
        $match: { status: "active" }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$salary" }
        }
      }
    ]);
    const totalPayroll = payroll[0]?.total || 0;

    // Inventory Metrics
    const inventoryValue = await Inventory.aggregate([
      {
        $project: {
          value: { $multiply: ["$currentStock", "$unitPrice"] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" }
        }
      }
    ]);
    const totalInventoryValue = inventoryValue[0]?.total || 0;

    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ["$currentStock", "$minStock"] }
    });

    const totalItems = await Inventory.countDocuments();

    // Production Metrics
    const productionBatches = await Production.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const previousProductionBatches = await Production.find({
      createdAt: { $gte: previousStart, $lte: previousEnd }
    });

    const completedBatches = productionBatches.filter(b => b.status === "completed").length;
    const activeBatches = productionBatches.filter(b => ["running", "paused"].includes(b.status)).length;
    
    const totalYield = productionBatches.reduce((sum, b) => sum + (b.yield || 0), 0);
    const targetYield = productionBatches.reduce((sum, b) => sum + (b.targetYield || 0), 0);
    const yieldEfficiency = targetYield > 0 ? (totalYield / targetYield) * 100 : 0;

    // Orders/Sales Metrics
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const previousOrders = await Order.find({
      createdAt: { $gte: previousStart, $lte: previousEnd }
    });

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const completedOrders = orders.filter(o => o.status === "completed").length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;

    const prevTotalOrders = previousOrders.length;
    const prevTotalSales = previousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Customer Metrics
    const totalCustomers = await Customer.countDocuments();
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // User/System Metrics
    const totalUsers = await User.countDocuments({ approved: true });
    const pendingUsers = await User.countDocuments({ approved: false });

    // Revenue Trend (monthly breakdown)
    const revenueTrend = await Transaction.aggregate([
      {
        $match: {
          type: "income",
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Calculate percentage changes
    const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100).toFixed(2) : 0;
    const expenseChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses * 100).toFixed(2) : 0;
    const profitChange = prevNetProfit !== 0 ? ((netProfit - prevNetProfit) / Math.abs(prevNetProfit) * 100).toFixed(2) : 0;
    const employeeChange = previousEmployees > 0 ? ((currentEmployees - previousEmployees) / previousEmployees * 100).toFixed(2) : 0;
    const orderChange = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders * 100).toFixed(2) : 0;
    const salesChange = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales * 100).toFixed(2) : 0;
    const productionChange = previousProductionBatches.length > 0 ? ((productionBatches.length - previousProductionBatches.length) / previousProductionBatches.length * 100).toFixed(2) : 0;

    // Response data
    res.json({
      success: true,
      period,
      dateRange: {
        start: startDate,
        end: endDate
      },
      financial: {
        netWorth,
        totalAssets,
        totalLiabilities,
        revenue: totalIncome,
        expenses: totalExpenses,
        netProfit,
        revenueChange: parseFloat(incomeChange),
        expenseChange: parseFloat(expenseChange),
        profitChange: parseFloat(profitChange)
      },
      employees: {
        total: activeEmployees,
        active: activeEmployees,
        onLeave: onLeaveEmployees,
        totalPayroll,
        change: parseFloat(employeeChange)
      },
      inventory: {
        totalValue: totalInventoryValue,
        totalItems,
        lowStockItems,
        stockHealthPercentage: totalItems > 0 ? ((totalItems - lowStockItems) / totalItems * 100).toFixed(2) : 100
      },
      production: {
        totalBatches: productionBatches.length,
        completedBatches,
        activeBatches,
        totalYield,
        targetYield,
        yieldEfficiency: yieldEfficiency.toFixed(2),
        change: parseFloat(productionChange)
      },
      sales: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalSales,
        averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0,
        orderChange: parseFloat(orderChange),
        salesChange: parseFloat(salesChange)
      },
      customers: {
        total: totalCustomers,
        new: newCustomers
      },
      users: {
        total: totalUsers,
        pending: pendingUsers
      },
      trends: {
        revenue: revenueTrend.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          value: item.total
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard metrics",
      error: error.message
    });
  }
};

module.exports = {
  getDashboardMetrics
};
