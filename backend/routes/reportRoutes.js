// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const {
  getReportsDashboard,
  viewReport,
  downloadReport,
} = require("../controllers/reportsController");

router.get("/dashboard", getReportsDashboard);   // list of reports
router.get("/view/:id", viewReport);             // view inline
router.get("/download/:id", downloadReport);     // force download

module.exports = router;
