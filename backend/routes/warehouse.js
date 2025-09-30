const express = require("express");
const {
  // Zone operations
  createWarehouseZone,
  getAllWarehouseZones,
  getWarehouseZoneById,
  updateWarehouseZone,
  deleteWarehouseZone,
  
  // Stock movement operations
  createStockMovement,
  getAllStockMovements,
  
  // Low stock operations
  getLowStockItems,
  updateLowStockAlert,
  
  // Analytics
  getWarehouseAnalytics,
} = require("../controllers/warehouseController");

const router = express.Router();

// ========================
// WAREHOUSE ZONES ROUTES
// ========================

// Create a new warehouse zone
router.post("/zones", createWarehouseZone);

// Get all warehouse zones
router.get("/zones", getAllWarehouseZones);

// Get a specific warehouse zone by ID
router.get("/zones/:id", getWarehouseZoneById);

// Update a warehouse zone
router.put("/zones/:id", updateWarehouseZone);

// Delete a warehouse zone
router.delete("/zones/:id", deleteWarehouseZone);

// ========================
// STOCK MOVEMENTS ROUTES
// ========================

// Create a stock movement
router.post("/stock-movements", createStockMovement);

// Get all stock movements (with filtering support)
router.get("/stock-movements", getAllStockMovements);

// ========================
// LOW STOCK ALERTS ROUTES
// ========================

// Get low stock items
router.get("/low-stock", getLowStockItems);

// Update low stock alert status
router.put("/low-stock-alert/:id", updateLowStockAlert);

// ========================
// ANALYTICS ROUTES
// ========================

// Get warehouse analytics
router.get("/analytics", getWarehouseAnalytics);

module.exports = router;