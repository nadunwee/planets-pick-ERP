// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const {
  getReportsDashboard,
  viewReport,
  downloadReport,
  generateProcurementSummaryPDF,
  generateSupplierPerformancePDF,
  generatePurchaseOrdersPDF,
  generateInventoryReportPDF,
  generateOrderReportPDF,
} = require("../controllers/reportsController");

router.get("/dashboard", getReportsDashboard);   // list of reports
router.get("/view/:id", viewReport);             // view inline
router.get("/download/:id", downloadReport);     // force download

// PDF Generation endpoints
router.post("/generate/procurement-summary", generateProcurementSummaryPDF);
router.post("//generate/supplier-performance", generateSupplierPerformancePDF);
router.post("/generate/purchase-orders", generatePurchaseOrdersPDF);
router.post("/generate/inventory-report", generateInventoryReportPDF);
router.post("/generate/order-report", generateOrderReportPDF);

module.exports = router;