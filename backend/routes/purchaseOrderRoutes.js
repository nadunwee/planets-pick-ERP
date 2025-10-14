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
router.get("/", allowLevels("L1", "L2", "L3", "L4", "L5"), listPOs);

// Get one
router.get("/:id", allowLevels("L1", "L2", "L3", "L4", "L5"), getPO);

// Create
router.post("/", allowLevels("L1", "L2", "L3", "L4", "L5"), createPO);

// Update
router.put("/:id", allowLevels("L1", "L2", "L3", "L4", "L5"), updatePO);

// Delete
router.delete("/:id", allowLevels("L1", "L2", "L3", "L4", "L5"), deletePO);

// Approve
router.patch("/:id/approve", allowLevels("L2", "L4", "L5"), approvePO);

// Mark delivered - Only L2, L4, and L5 can mark delivered (not L3)
router.patch("/:id/deliver", allowLevels("L2", "L4", "L5"), markDelivered);

module.exports = router;
