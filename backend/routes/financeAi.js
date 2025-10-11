const express = require("express");
const router = express.Router();
const financeAiController = require("../controllers/financeAiController");

// AI Prediction route
router.get("/predict", financeAiController.predictFinances);

module.exports = router;
