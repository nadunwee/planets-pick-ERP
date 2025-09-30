const express = require("express");
const {
  addInventoryItem,
  editInventoryItem,
  updateStock,
  getAllInventory,
  getInventoryItem,
  deleteInventoryItem,
} = require("../controllers/inventoryController");

const router = express.Router();

// Add a new inventory item
router.post("/add_inventory", addInventoryItem);

// Edit inventory item (name, type, unit price)
router.put("/edit_inventory/:id", editInventoryItem);

// Update stock (current stock)
router.put("/update_stock/:id", updateStock);

// Get all inventory items
router.get("/all_inventory", getAllInventory);

// Get single inventory item
router.get("/:id", getInventoryItem);

// Delete inventory item
router.delete("/:id", deleteInventoryItem);

module.exports = router;
