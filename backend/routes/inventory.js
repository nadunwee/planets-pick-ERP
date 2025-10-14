const express = require("express");
const {
  addInventoryItem,
  editInventoryItem,
  updateStock,
  getAllInventory,
} = require("../controllers/inventoryController");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

const router = express.Router();

router.use(requireAuth);

// Add a new inventory item - All levels can add
router.post("/add_inventory", allowLevels("L1", "L2", "L3", "L4", "L5"), addInventoryItem);

// Edit inventory item (name, type, unit price) - All levels can edit
router.put("/edit_inventory/:id", allowLevels("L1", "L2", "L3", "L4", "L5"), editInventoryItem);

// Update stock (current stock) - All levels can update
router.put("/update_stock/:id", allowLevels("L1", "L2", "L3", "L4", "L5"), updateStock);

// Get all inventory items - All levels can view
router.get("/all_inventory", allowLevels("L1", "L2", "L3", "L4", "L5"), getAllInventory);

module.exports = router;
