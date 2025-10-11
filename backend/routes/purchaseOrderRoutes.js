const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const {
  allowLevels,
  requireLevelAtLeast,
} = require("../middleware/accessControl");
const {
  listPOs,
  getPO,
  createPO,
  updatePO,
  deletePO,
  approvePO,
  markDelivered,
} = require("../controllers/purchaseOrderController");

router.use(requireAuth);

// List all
router.get("/", allowLevels("L1", "L2", "L3", "L4"), listPOs);

// Get one
router.get("/:id", allowLevels("L1", "L2", "L3", "L4"), getPO);

// Create
router.post("/", allowLevels("L1", "L2", "L3", "L4"), createPO);

// Update
router.put("/:id", allowLevels("L1", "L2", "L3", "L4"), updatePO);

// Delete
router.delete("/:id", allowLevels("L1", "L2", "L3", "L4"), deletePO);

// Approve
router.patch("/:id/approve", allowLevels("L2", "L4"), approvePO);

// Mark delivered
router.patch("/:id/deliver", requireLevelAtLeast("L2"), markDelivered);

module.exports = router;
