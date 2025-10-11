// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");
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

router.use(requireAuth);

router.get("/dashboard", allowLevels("L2", "L3", "L4"), getReportsDashboard); // list of reports
router.get("/view/:id", allowLevels("L2", "L3", "L4"), viewReport); // view inline
router.get("/download/:id", allowLevels("L2", "L3", "L4"), downloadReport); // force download

// PDF Generation endpoints
router.post(
  "/generate/procurement-summary",
  allowLevels("L2", "L3", "L4"),
  generateProcurementSummaryPDF
);
router.post(
  "/generate/supplier-performance",
  allowLevels("L2", "L3", "L4"),
  generateSupplierPerformancePDF
);
router.post(
  "/generate/purchase-orders",
  allowLevels("L2", "L3", "L4"),
  generatePurchaseOrdersPDF
);
router.post(
  "/generate/inventory-report",
  allowLevels("L2", "L3", "L4"),
  generateInventoryReportPDF
);
router.post(
  "/generate/order-report",
  allowLevels("L2", "L3", "L4"),
  generateOrderReportPDF
);

module.exports = router;
