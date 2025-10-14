const express = require("express");
const router = express.Router();
const { getDashboardMetrics } = require("../controllers/dashboardController");

// GET /api/dashboard/metrics?period=30days
router.get("/metrics", getDashboardMetrics);

module.exports = router;
