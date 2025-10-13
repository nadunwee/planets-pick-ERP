// controllers/reportController.js
const path = require("path");
const fs = require("fs");
const pdfService = require("../services/pdfService");
const Supplier = require("../models/Supplier");
const PurchaseOrder = require("../models/PurchaseOrder");
const InventoryItem = require("../models/inventoryModel");
const Order = require("../models/orderModel");

const REPORT_DEFINITIONS = [
  {
    id: "1",
    title: "Monthly Procurement Summary",
    category: "Procurement",
    filename: "procurement-summary.pdf",
    format: "pdf",
    description: "Comprehensive analysis of monthly procurement activities",
  },
  {
    id: "2",
    title: "Supplier Performance Report",
    category: "Suppliers",
    filename: "supplier-performance.pdf",
    format: "pdf",
    description: "Performance metrics and rankings for all suppliers",
  },
  {
    id: "3",
    title: "Purchase Order Analysis",
    category: "Orders",
    filename: "purchase-orders.pdf",
    format: "pdf",
    description: "Detailed analysis of purchase orders and trends",
  },
  {
    id: "4",
    title: "Inventory Status Report",
    category: "Inventory",
    filename: "inventory-report.pdf",
    format: "pdf",
    description: "Current stock levels, values, and statuses.",
  },
  {
    id: "5",
    title: "Order Summary Report",
    category: "Orders",
    filename: "order-report.pdf",
    format: "pdf",
    description: "A summary of all orders.",
  },
];

const departmentCategoryAccess = {
  Procurement: ["Procurement", "Suppliers", "Orders"],
  Finance: ["Finance"],
  Inventory: ["Inventory"],
  Production: ["Production", "Orders"],
  "Human Resources": ["HR"],
  HR: ["HR"],
  Administration: [
    "Procurement",
    "Suppliers",
    "Orders",
    "Inventory",
    "Finance",
  ],
};

const isReportCategoryAllowed = (level, department, category) => {
  // L4 can view all reports including Finance
  if (level === "L4") return true;

  // L3 can view all reports EXCEPT Finance (Finance reports are L4 only)
  if (level === "L3") {
    return category !== "Finance";
  }

  // L2 can only view reports relevant to their department
  if (level === "L2") {
    const allowed = departmentCategoryAccess[department] || [];
    if (!allowed.length) {
      // default to excluding finance content only
      return category !== "Finance";
    }
    return allowed.includes(category);
  }

  // L1 cannot view any reports
  return false;
};

const filterReportsForUser = (reports, user) => {
  if (!user) return [];
  return reports.filter((report) =>
    isReportCategoryAllowed(user.level, user.department, report.category)
  );
};

exports.getReportsDashboard = async (req, res) => {
  try {
    // Get available reports from filesystem
    const reportsDir = path.join(__dirname, "..", "reports");
    const reports = [];

    // Check if reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Check which reports are available
    for (const report of REPORT_DEFINITIONS) {
      const filePath = path.join(reportsDir, report.filename);
      const fileExists = fs.existsSync(filePath);

      if (fileExists) {
        const stats = fs.statSync(filePath);
        reports.push({
          id: report.id,
          title: report.title,
          category: report.category,
          format: report.format || "pdf",
          date: stats.mtime.toISOString().split("T")[0],
          fileUrl: `/api/reports/view/${report.id}`,
          downloadUrl: `/api/reports/download/${report.id}`,
          description: report.description,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          lastModified: stats.mtime.toISOString(),
        });
      } else {
        // Add placeholder for missing reports
        reports.push({
          id: report.id,
          title: report.title,
          category: report.category,
          format: report.format || "pdf",
          date: new Date().toISOString().split("T")[0],
          fileUrl: `/api/reports/view/${report.id}`,
          downloadUrl: `/api/reports/download/${report.id}`,
          description: report.description,
          size: "N/A",
          lastModified: null,
          isPlaceholder: true,
        });
      }
    }

    const filteredReports = filterReportsForUser(reports, req.user);

    res.json({ reports: filteredReports });
  } catch (err) {
    console.error("Error loading reports:", err);
    res.status(500).json({ message: "Failed to load reports" });
  }
};

// Serve PDF inline (for viewing)
exports.viewReport = (req, res) => {
  const { id } = req.params;

  const definition = REPORT_DEFINITIONS.find((item) => item.id === id);
  if (!definition) {
    return res.status(404).json({ message: "Report not found" });
  }

  if (
    !isReportCategoryAllowed(
      req.user.level,
      req.user.department,
      definition.category
    )
  ) {
    return res
      .status(403)
      .json({ message: "Insufficient privileges for this report" });
  }

  const filePath = path.join(__dirname, "..", "reports", definition.filename);
  res.sendFile(filePath);
};

// Download PDF
exports.downloadReport = (req, res) => {
  const { id } = req.params;

  const definition = REPORT_DEFINITIONS.find((item) => item.id === id);
  if (!definition) {
    return res.status(404).json({ message: "Report not found" });
  }

  if (
    !isReportCategoryAllowed(
      req.user.level,
      req.user.department,
      definition.category
    )
  ) {
    return res
      .status(403)
      .json({ message: "Insufficient privileges for this report" });
  }

  const filePath = path.join(__dirname, "..", "reports", definition.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Report file not found" });
  }

  res.download(filePath, definition.filename);
};

// Generate PDF reports
exports.generateProcurementSummaryPDF = async (req, res) => {
  try {
    if (
      !isReportCategoryAllowed(
        req.user.level,
        req.user.department,
        "Procurement"
      )
    ) {
      return res
        .status(403)
        .json({ message: "Insufficient privileges for procurement reports" });
    }

    const { startDate, endDate } = req.query;

    // Get data from database
    const suppliers = await Supplier.find({});
    const orders = await PurchaseOrder.find({
      createdAt: {
        $gte: new Date(
          startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ),
        $lte: new Date(endDate || new Date()),
      },
    }).populate("supplier");

    // Calculate summary data
    const totalOrders = orders.length;
    const totalSpend = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const activeSuppliers = suppliers.length;
    const averageOrderValue =
      totalOrders > 0 ? (totalSpend / totalOrders).toFixed(2) : 0;

    // Get top suppliers by spend
    const supplierSpend = {};
    orders.forEach((order) => {
      if (order.supplier) {
        const supplierId = order.supplier._id.toString();
        if (!supplierSpend[supplierId]) {
          supplierSpend[supplierId] = {
            name: order.supplier.name,
            orders: 0,
            spend: 0,
          };
        }
        supplierSpend[supplierId].orders += 1;
        supplierSpend[supplierId].spend += order.totalAmount || 0;
      }
    });

    const topSuppliers = Object.values(supplierSpend)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10)
      .map((supplier) => ({
        ...supplier,
        percentage:
          totalSpend > 0 ? ((supplier.spend / totalSpend) * 100).toFixed(1) : 0,
      }));

    const reportData = {
      generatedDate: new Date().toLocaleDateString(),
      startDate:
        startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      endDate: endDate || new Date().toLocaleDateString(),
      totalOrders,
      totalSpend: totalSpend.toFixed(2),
      activeSuppliers,
      averageOrderValue,
      topSuppliers,
    };

    const outputPath = path.join(
      __dirname,
      "..",
      "reports",
      "procurement-summary.pdf"
    );
    const result = await pdfService.generateReportPDF(
      reportData,
      "procurement-summary",
      outputPath
    );

    res.json({
      success: true,
      message: "PDF generated successfully",
      filePath: result.filePath,
      size: result.size,
      downloadUrl: `/api/reports/download/1`,
    });
  } catch (error) {
    console.error("Error generating procurement summary PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: error.message });
  }
};

exports.generateSupplierPerformancePDF = async (req, res) => {
  try {
    if (
      !isReportCategoryAllowed(req.user.level, req.user.department, "Suppliers")
    ) {
      return res
        .status(403)
        .json({ message: "Insufficient privileges for supplier reports" });
    }

    const suppliers = await Supplier.find({});

    const suppliersWithRatings = suppliers.map((supplier) => {
      const onTimeDelivery = supplier.onTimeDeliveryRate || 0;
      const qualityScore = supplier.qualityScore || 0;
      const responsivenessScore = supplier.responsivenessScore || 0;

      const overallScore =
        (onTimeDelivery + qualityScore + responsivenessScore) / 3;
      let overallRating, ratingClass;

      if (overallScore >= 90) {
        overallRating = "Excellent";
        ratingClass = "excellent";
      } else if (overallScore >= 75) {
        overallRating = "Good";
        ratingClass = "good";
      } else if (overallScore >= 60) {
        overallRating = "Average";
        ratingClass = "average";
      } else {
        overallRating = "Poor";
        ratingClass = "poor";
      }

      return {
        name: supplier.name,
        onTimeDelivery: onTimeDelivery.toFixed(1),
        qualityScore: qualityScore.toFixed(1),
        responsivenessScore: responsivenessScore.toFixed(1),
        overallRating,
        ratingClass,
        totalOrders: supplier.ordersCount || 0,
      };
    });

    const reportData = {
      generatedDate: new Date().toLocaleDateString(),
      suppliers: suppliersWithRatings,
    };

    const outputPath = path.join(
      __dirname,
      "..",
      "reports",
      "supplier-performance.pdf"
    );
    const result = await pdfService.generateReportPDF(
      reportData,
      "supplier-performance",
      outputPath
    );

    res.json({
      success: true,
      message: "PDF generated successfully",
      filePath: result.filePath,
      size: result.size,
      downloadUrl: `/api/reports/download/2`,
    });
  } catch (error) {
    console.error("Error generating supplier performance PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: error.message });
  }
};

exports.generatePurchaseOrdersPDF = async (req, res) => {
  try {
    if (
      !isReportCategoryAllowed(req.user.level, req.user.department, "Orders")
    ) {
      return res
        .status(403)
        .json({ message: "Insufficient privileges for order reports" });
    }

    const { startDate, endDate, status } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (status) {
      filter.status = status;
    }

    const orders = await PurchaseOrder.find(filter)
      .populate("supplier")
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent orders

    const ordersWithStatus = orders.map((order) => {
      let statusClass;
      switch (order.status) {
        case "pending":
          statusClass = "pending";
          break;
        case "approved":
          statusClass = "approved";
          break;
        case "delivered":
          statusClass = "delivered";
          break;
        default:
          statusClass = "pending";
      }

      return {
        orderId: order.orderNumber || order._id.toString().slice(-8),
        supplierName: order.supplier ? order.supplier.name : "Unknown Supplier",
        orderDate: order.createdAt.toLocaleDateString(),
        totalAmount: (order.totalAmount || 0).toFixed(2),
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        statusClass,
        itemCount: order.items ? order.items.length : 0,
      };
    });

    const reportData = {
      generatedDate: new Date().toLocaleDateString(),
      startDate:
        startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      endDate: endDate || new Date().toLocaleDateString(),
      orders: ordersWithStatus,
    };

    const outputPath = path.join(
      __dirname,
      "..",
      "reports",
      "purchase-orders.pdf"
    );
    const result = await pdfService.generateReportPDF(
      reportData,
      "purchase-orders",
      outputPath
    );

    res.json({
      success: true,
      message: "PDF generated successfully",
      filePath: result.filePath,
      size: result.size,
      downloadUrl: `/api/reports/download/3`,
    });
  } catch (error) {
    console.error("Error generating purchase orders PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: error.message });
  }
};

exports.generateInventoryReportPDF = async (req, res) => {
  try {
    if (
      !isReportCategoryAllowed(req.user.level, req.user.department, "Inventory")
    ) {
      return res
        .status(403)
        .json({ message: "Insufficient privileges for inventory reports" });
    }

    const items = await InventoryItem.find({});

    const totalItems = items.length;
    const totalValue = items.reduce(
      (sum, item) =>
        sum + item.currentStock * (item.price || item.unitPrice || 0),
      0
    );
    const lowStockItems = items.filter(
      (item) => item.currentStock <= item.minStock && item.currentStock > 0
    ).length;
    const outOfStockItems = items.filter(
      (item) => item.currentStock === 0
    ).length;

    const itemsData = items.map((item) => {
      const status =
        item.currentStock === 0
          ? "OUT OF STOCK"
          : item.currentStock <= item.minStock
          ? "LOW STOCK"
          : "OK";
      let statusClass;
      switch (status) {
        case "OK":
          statusClass = "ok";
          break;
        case "LOW STOCK":
          statusClass = "low-stock";
          break;
        case "OUT OF STOCK":
          statusClass = "out-of-stock";
          break;
        default:
          statusClass = "ok";
      }
      return {
        name: item.name,
        category: item.type,
        sku: item.sku,
        quantity: item.currentStock,
        unitPrice: (item.price || item.unitPrice || 0).toFixed(2),
        totalValue: (
          item.currentStock * (item.price || item.unitPrice || 0)
        ).toFixed(2),
        status,
        statusClass,
      };
    });

    const reportData = {
      generatedDate: new Date().toLocaleDateString(),
      totalItems,
      totalValue: totalValue.toLocaleString(),
      lowStockItems,
      outOfStockItems,
      items: itemsData,
    };

    const outputPath = path.join(
      __dirname,
      "..",
      "reports",
      "inventory-report.pdf"
    );
    const result = await pdfService.generateReportPDF(
      reportData,
      "inventory-report",
      outputPath
    );

    res.json({
      success: true,
      message: "PDF generated successfully",
      filePath: result.filePath,
      size: result.size,
      downloadUrl: `/api/reports/download/4`,
    });
  } catch (error) {
    console.error("Error generating inventory report PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: error.message });
  }
};

exports.generateOrderReportPDF = async (req, res) => {
  try {
    if (
      !isReportCategoryAllowed(req.user.level, req.user.department, "Orders")
    ) {
      return res
        .status(403)
        .json({ message: "Insufficient privileges for order reports" });
    }

    const orders = await Order.find({}).populate("customer");

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersData = orders.map((order) => {
      return {
        orderId: order.orderId,
        customerName: order.customer ? order.customer.name : "N/A",
        orderedOn: new Date(order.orderedOn).toLocaleDateString(),
        totalAmount: order.totalAmount.toLocaleString(),
        status: order.status,
        items: order.items.map((item) => ({
          productName: item.productName || item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        shippingMethod: order.shippingMethod,
      };
    });

    const reportData = {
      generatedDate: new Date().toLocaleDateString(),
      totalOrders,
      totalRevenue: totalRevenue.toLocaleString(),
      pendingOrders,
      averageOrderValue: averageOrderValue.toLocaleString(),
      orders: ordersData,
    };

    const outputPath = path.join(
      __dirname,
      "..",
      "reports",
      "order-report.pdf"
    );
    const result = await pdfService.generateReportPDF(
      reportData,
      "order-report",
      outputPath
    );

    res.json({
      success: true,
      message: "PDF generated successfully",
      filePath: result.filePath,
      size: result.size,
      downloadUrl: `/api/reports/download/5`,
    });
  } catch (error) {
    console.error("Error generating order report PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF", error: error.message });
  }
};
