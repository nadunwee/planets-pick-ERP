const express = require("express");
const router = express.Router();
const financeAiController = require("../controllers/financeAiController");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

router.use(requireAuth);

// AI Prediction route - Only L3 and L4 (Finance Manager and Admin)
router.get("/predict", allowLevels("L3", "L4"), financeAiController.predictFinances);

module.exports = router;
