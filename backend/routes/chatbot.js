const express = require("express");
const { chat } = require("../controllers/chatbotController.js");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

const router = express.Router();

router.use(requireAuth);

// Chat endpoint - All authenticated users can use chatbot
router.post("/chat", allowLevels("L1", "L2", "L3", "L4"), chat);

module.exports = router;
