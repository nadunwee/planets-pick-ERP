const ProcurementReport = require('../models/ProcurementReport');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const mongoose = require('mongoose');

// Generate Supplier Ranking Report
exports.generateSupplierRanking = async (req, res) => {
  try {
    const { startDate, endDate, weights = {} } = req.body;
    const { wOnTime = 0.4, wQuality = 0.4, wResponse = 0.2 } = weights;

    // Get all suppliers with their performance data
    const suppliers = await Supplier.find({ deleted: false });
    
    // Get purchase orders in date range for calculations
    const orders = await PurchaseOrder.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: { $in: ['Approved', 'Delivered'] }
    });

    const rankedSuppliers = suppliers.map(supplier => {
      // Calculate performance metrics
      const supplierOrders = orders.filter(order => 
        order.supplierId.toString() === supplier._id.toString()
      );

      const onTimeRate = supplier.onTimeDeliveryRate || 0;
      const qualityScore = supplier.qualityScore || 0;
      const responseScore = supplier.responsivenessScore || 0;

      // Calculate weighted score
      const weightedScore = (onTimeRate * wOnTime) + (qualityScore * wQuality) + (responseScore * wResponse);

      // Calculate additional metrics
      const totalSpend = supplierOrders.reduce((sum, order) => {
        return sum + (order.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0));
      }, 0);

      const orderCount = supplierOrders.length;
      const avgOrderValue = orderCount > 0 ? totalSpend / orderCount : 0;

      return {
        supplier: {
          _id: supplier._id,
          name: supplier.name,
          code: supplier.code,
          category: supplier.category,
          status: supplier.status
        },
        metrics: {
          onTimeRate,
          qualityScore,
          responseScore,
          weightedScore: Number(weightedScore.toFixed(2)),
          totalSpend,
          orderCount,
          avgOrderValue: Number(avgOrderValue.toFixed(2))
        }
      };
    });

    // Sort by weighted score
    rankedSuppliers.sort((a, b) => b.metrics.weightedScore - a.metrics.weightedScore);

    // Create report record
    const report = new ProcurementReport({
      reportType: 'supplier_ranking',
      title: 'Supplier Performance Ranking',
      description: `Supplier ranking based on performance metrics from ${startDate} to ${endDate}`,
      generatedBy: req.user.id,
      dateRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
      data: {
        rankings: rankedSuppliers,
        weights: { wOnTime, wQuality, wResponse },
        totalSuppliers: suppliers.length,
        dateRange: { startDate, endDate }
      },
      status: 'completed',
      metadata: {
        totalRecords: suppliers.length,
        generationTime: Date.now()
      }
    });

    await report.save();

    res.json({
      success: true,
      report: {
        id: report._id,
        title: report.title,
        data: report.data,
        generatedAt: report.createdAt
      }
    });

  } catch (error) {
    console.error('Error generating supplier ranking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate supplier ranking report',
      error: error.message 
    });
  }
};

// Generate Spending Analytics Report
exports.generateSpendingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.body;

    // Get purchase orders in date range
    const orders = await PurchaseOrder.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: { $in: ['Approved', 'Delivered'] }
    }).populate('supplierId', 'name code category');

    // Calculate spending by time period
    const spendingByPeriod = {};
    const spendingBySupplier = {};
    const spendingByCategory = {};

    orders.forEach(order => {
      const orderTotal = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      // Group by time period
      const periodKey = groupBy === 'month' 
        ? order.createdAt.toISOString().substring(0, 7) // YYYY-MM
        : order.createdAt.toISOString().substring(0, 4); // YYYY

      spendingByPeriod[periodKey] = (spendingByPeriod[periodKey] || 0) + orderTotal;

      // Group by supplier
      const supplierId = order.supplierId._id.toString();
      if (!spendingBySupplier[supplierId]) {
        spendingBySupplier[supplierId] = {
          supplier: order.supplierId,
          totalSpend: 0,
          orderCount: 0
        };
      }
      spendingBySupplier[supplierId].totalSpend += orderTotal;
      spendingBySupplier[supplierId].orderCount += 1;

      // Group by category
      const category = order.supplierId.category || 'Uncategorized';
      spendingByCategory[category] = (spendingByCategory[category] || 0) + orderTotal;
    });

    // Convert to arrays and sort
    const spendingTrends = Object.entries(spendingByPeriod)
      .map(([period, amount]) => ({ period, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const topSuppliers = Object.values(spendingBySupplier)
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    const categoryBreakdown = Object.entries(spendingByCategory)
      .map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate summary statistics
    const totalSpend = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
    }, 0);

    const avgOrderValue = orders.length > 0 ? totalSpend / orders.length : 0;

    // Create report record
    const report = new ProcurementReport({
      reportType: 'spending_analytics',
      title: 'Procurement Spending Analytics',
      description: `Spending analysis from ${startDate} to ${endDate}`,
      generatedBy: req.user.id,
      dateRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
      data: {
        summary: {
          totalSpend: Number(totalSpend.toFixed(2)),
          totalOrders: orders.length,
          avgOrderValue: Number(avgOrderValue.toFixed(2)),
          dateRange: { startDate, endDate }
        },
        spendingTrends,
        topSuppliers,
        categoryBreakdown
      },
      status: 'completed',
      metadata: {
        totalRecords: orders.length,
        generationTime: Date.now()
      }
    });

    await report.save();

    res.json({
      success: true,
      report: {
        id: report._id,
        title: report.title,
        data: report.data,
        generatedAt: report.createdAt
      }
    });

  } catch (error) {
    console.error('Error generating spending analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate spending analytics report',
      error: error.message 
    });
  }
};

// Generate Orders by Supplier Report
exports.generateOrdersBySupplier = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Get suppliers with their orders
    const suppliers = await Supplier.find({ deleted: false });
    const ordersBySupplier = [];

    for (const supplier of suppliers) {
      const orders = await PurchaseOrder.find({
        supplierId: supplier._id,
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });

      const totalValue = orders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
      }, 0);

      const statusBreakdown = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      ordersBySupplier.push({
        supplier: {
          _id: supplier._id,
          name: supplier.name,
          code: supplier.code,
          category: supplier.category
        },
        metrics: {
          totalOrders: orders.length,
          totalValue: Number(totalValue.toFixed(2)),
          avgOrderValue: orders.length > 0 ? Number((totalValue / orders.length).toFixed(2)) : 0,
          statusBreakdown
        }
      });
    }

    // Sort by total value
    ordersBySupplier.sort((a, b) => b.metrics.totalValue - a.metrics.totalValue);

    // Create report record
    const report = new ProcurementReport({
      reportType: 'orders_by_supplier',
      title: 'Orders by Supplier Analysis',
      description: `Order analysis by supplier from ${startDate} to ${endDate}`,
      generatedBy: req.user.id,
      dateRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
      data: {
        ordersBySupplier,
        summary: {
          totalSuppliers: suppliers.length,
          dateRange: { startDate, endDate }
        }
      },
      status: 'completed',
      metadata: {
        totalRecords: suppliers.length,
        generationTime: Date.now()
      }
    });

    await report.save();

    res.json({
      success: true,
      report: {
        id: report._id,
        title: report.title,
        data: report.data,
        generatedAt: report.createdAt
      }
    });

  } catch (error) {
    console.error('Error generating orders by supplier report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate orders by supplier report',
      error: error.message 
    });
  }
};

// Generate Procurement Cycle Report
exports.generateProcurementCycle = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Get orders with their lifecycle data
    const orders = await PurchaseOrder.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('supplierId', 'name code');

    const cycleData = orders.map(order => {
      const created = new Date(order.createdAt);
      const updated = new Date(order.updatedAt);
      const cycleTime = Math.ceil((updated - created) / (1000 * 60 * 60 * 24)); // days

      return {
        orderId: order._id,
        supplier: order.supplierId,
        status: order.status,
        cycleTime,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });

    // Calculate cycle time statistics
    const cycleTimes = cycleData.map(item => item.cycleTime);
    const avgCycleTime = cycleTimes.length > 0 
      ? cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length 
      : 0;

    const minCycleTime = Math.min(...cycleTimes);
    const maxCycleTime = Math.max(...cycleTimes);

    // Group by status
    const statusBreakdown = cycleData.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = { count: 0, avgCycleTime: 0, totalCycleTime: 0 };
      }
      acc[item.status].count += 1;
      acc[item.status].totalCycleTime += item.cycleTime;
      acc[item.status].avgCycleTime = acc[item.status].totalCycleTime / acc[item.status].count;
      return acc;
    }, {});

    // Create report record
    const report = new ProcurementReport({
      reportType: 'procurement_cycle',
      title: 'Procurement Cycle Analysis',
      description: `Procurement cycle time analysis from ${startDate} to ${endDate}`,
      generatedBy: req.user.id,
      dateRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
      data: {
        cycleData,
        statistics: {
          avgCycleTime: Number(avgCycleTime.toFixed(2)),
          minCycleTime,
          maxCycleTime,
          totalOrders: cycleData.length
        },
        statusBreakdown,
        dateRange: { startDate, endDate }
      },
      status: 'completed',
      metadata: {
        totalRecords: cycleData.length,
        generationTime: Date.now()
      }
    });

    await report.save();

    res.json({
      success: true,
      report: {
        id: report._id,
        title: report.title,
        data: report.data,
        generatedAt: report.createdAt
      }
    });

  } catch (error) {
    console.error('Error generating procurement cycle report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate procurement cycle report',
      error: error.message 
    });
  }
};

// Get all generated reports
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, reportType, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (reportType) filter.reportType = reportType;
    if (startDate && endDate) {
      filter['dateRange.startDate'] = { $gte: new Date(startDate) };
      filter['dateRange.endDate'] = { $lte: new Date(endDate) };
    }

    const [reports, total] = await Promise.all([
      ProcurementReport.find(filter)
        .populate('generatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      ProcurementReport.countDocuments(filter)
    ]);

    res.json({
      success: true,
      reports,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reports',
      error: error.message 
    });
  }
};

// Get specific report
exports.getReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await ProcurementReport.findById(id)
      .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch report',
      error: error.message 
    });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await ProcurementReport.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete report',
      error: error.message 
    });
  }
};
