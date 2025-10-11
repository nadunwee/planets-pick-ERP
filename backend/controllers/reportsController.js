// controllers/reportController.js
const path = require("path");
const fs = require("fs");
const pdfService = require("../services/pdfService");
const Supplier = require("../models/Supplier");
const PurchaseOrder = require("../models/PurchaseOrder");

exports.getReportsDashboard = async (req, res) => {
  try {
    // Get available reports from filesystem
    const reportsDir = path.join(__dirname, "..", "reports");
    const reports = [];

    // Check if reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Define available reports
    const reportDefinitions = [
      {
        id: "1",
        title: "Monthly Procurement Summary",
        category: "Procurement",
        filename: "procurement-summary.pdf",
        description: "Comprehensive analysis of monthly procurement activities"
      },
      {
        id: "2", 
        title: "Supplier Performance Report",
        category: "Suppliers",
        filename: "supplier-performance.pdf",
        description: "Performance metrics and rankings for all suppliers"
      },
      {
        id: "3",
        title: "Purchase Order Analysis", 
        category: "Orders",
        filename: "purchase-orders.pdf",
        description: "Detailed analysis of purchase orders and trends"
      }
    ];

    // Check which reports are available
    for (const report of reportDefinitions) {
      const filePath = path.join(reportsDir, report.filename);
      const fileExists = fs.existsSync(filePath);
      
      if (fileExists) {
        const stats = fs.statSync(filePath);
        reports.push({
          id: report.id,
          title: report.title,
          category: report.category,
          date: stats.mtime.toISOString().split('T')[0],
          fileUrl: `/api/reports/view/${report.id}`,
          downloadUrl: `/api/reports/download/${report.id}`,
          description: report.description,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          lastModified: stats.mtime.toISOString()
        });
      } else {
        // Add placeholder for missing reports
        reports.push({
          id: report.id,
          title: report.title,
          category: report.category,
          date: new Date().toISOString().split('T')[0],
          fileUrl: `/api/reports/view/${report.id}`,
          downloadUrl: `/api/reports/download/${report.id}`,
          description: report.description,
          size: "N/A",
          lastModified: null,
          isPlaceholder: true
        });
      }
    }

    res.json({ reports });
  } catch (err) {
    console.error("Error loading reports:", err);
    res.status(500).json({ message: "Failed to load reports" });
  }
};

// Serve PDF inline (for viewing)
exports.viewReport = (req, res) => {
  const { id } = req.params;
  let file;

  switch (id) {
    case "1":
      file = "procurement-summary.pdf";
      break;
    case "2":
      file = "supplier-performance.pdf";
      break;
    case "3":
      file = "purchase-orders.pdf";
      break;
    default:
      return res.status(404).json({ message: "Report not found" });
  }

  const filePath = path.join(__dirname, "..", "reports", file);
  res.sendFile(filePath);
};

// Download PDF
exports.downloadReport = (req, res) => {
  const { id } = req.params;
  let file;

  switch (id) {
    case "1":
      file = "procurement-summary.pdf";
      break;
    case "2":
      file = "supplier-performance.pdf";
      break;
    case "3":
      file = "purchase-orders.pdf";
      break;
    default:
      return res.status(404).json({ message: "Report not found" });
  }

  const filePath = path.join(__dirname, "..", "reports", file);
  
  // Check if file exists
  const fs = require('fs');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Report file not found" });
  }
  
  res.download(filePath, file);
};

// Generate PDF reports
exports.generateProcurementSummaryPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get data from database
    const suppliers = await Supplier.find({});
    const orders = await PurchaseOrder.find({
      createdAt: {
        $gte: new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        $lte: new Date(endDate || new Date())
      }
    }).populate('supplier');

    // Calculate summary data
    const totalOrders = orders.length;
    const totalSpend = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const activeSuppliers = suppliers.length;
    const averageOrderValue = totalOrders > 0 ? (totalSpend / totalOrders).toFixed(2) : 0;

    // Get top suppliers by spend
    const supplierSpend = {};
    orders.forEach(order => {
      if (order.supplier) {
        const supplierId = order.supplier._id.toString();
        if (!supplierSpend[supplierId]) {
          supplierSpend[supplierId] = {
            name: order.supplier.name,
            orders: 0,
            spend: 0
          };
        }
        supplierSpend[supplierId].orders += 1;
        supplierSpend[supplierId].spend += order.totalAmount || 0;
      }
    });

    const topSuppliers = Object.values(supplierSpend)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10)
      .map(supplier => ({
        ...supplier,
        percentage: totalSpend > 0 ? ((supplier.spend / totalSpend) * 100).toFixed(1) : 0
      }));

    const reportData = {
      generatedDate: new Date().toLocaleDateString(),
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      endDate: endDate || new Date().toLocaleDateString(),
      totalOrders,
      totalSpend: totalSpend.toFixed(2),
      activeSuppliers,
      averageOrderValue,
      topSuppliers
    };

    const outputPath = path.join(__dirname, "..", "reports", "procurement-summary.pdf");
    const result = await pdfService.generateReportPDF(reportData, 'procurement-summary', outputPath);

    res.json({
      success: true,
      message: "PDF generated successfully",
      filePath: result.filePath,
      size: result.size,
      downloadUrl: `/api/reports/download/1`
    });

  } catch (error) {
    console.error("Error generating procurement summary PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF", error: error.message });
  }
};

exports.generateSupplierPerformancePDF = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    
    const suppliersWithRatings = suppliers.map(supplier => {
      const onTimeDelivery = supplier.onTimeDeliveryRate || 0;
      const qualityScore = supplier.qualityScore || 0;
      const responsivenessScore = supplier.responsivenessScore || 0;
      
      const overallScore = (onTimeDelivery + qualityScore + responsivenessScore) / 3;
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
        totalOrders: supplier.ordersCount || 0
      };
    });

    const reportData = {
      generatedDate: new Date().toLocaleDateString(),
      suppliers: suppliersWithRatings
    };

    const outputPath = path.join(__dirname, "..", "reports", "supplier-performance.pdf");
    const result = await pdfService.generateReportPDF(reportData, 'supplier-performance', outputPath);

    res.json({
      success: true,
      message: "PDF generated successfully",
      filePath: result.filePath,
      size: result.size,
      downloadUrl: `/api/reports/download/2`
    });

  } catch (error) {
    console.error("Error generating supplier performance PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF", error: error.message });
  }
};

exports.generatePurchaseOrdersPDF = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status) {
      filter.status = status;
    }

    const orders = await PurchaseOrder.find(filter)
      .populate('supplier')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent orders

    const ordersWithStatus = orders.map(order => {
      let statusClass;
      switch (order.status) {
        case 'pending':
          statusClass = 'pending';
          break;
        case 'approved':
          statusClass = 'approved';
          break;
        case 'delivered':
          statusClass = 'delivered';
          break;
        default:
          statusClass = 'pending';
      }

      return {
        orderId: order.orderNumber || order._id.toString().slice(-8),
        supplierName: order.supplier ? order.supplier.name : 'Unknown Supplier',
        orderDate: order.createdAt.toLocaleDateString(),
        totalAmount: (order.totalAmount || 0).toFixed(2),
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        statusClass,
        itemCount: order.items ? order.items.length : 0
      };
    });

    const reportData = {
      generatedDate: new Date().toLocaleDateString(),
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      endDate: endDate || new Date().toLocaleDateString(),
      orders: ordersWithStatus
    };

    const outputPath = path.join(__dirname, "..", "reports", "purchase-orders.pdf");
    const result = await pdfService.generateReportPDF(reportData, 'purchase-orders', outputPath);

    res.json({
      success: true,
      message: "PDF generated successfully",
      filePath: result.filePath,
      size: result.size,
      downloadUrl: `/api/reports/download/3`
    });

  } catch (error) {
    console.error("Error generating purchase orders PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF", error: error.message });
  }
};
