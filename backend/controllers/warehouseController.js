const WarehouseZone = require("../models/warehouseZoneModel");
const Inventory = require("../models/inventoryModel");
const StockMovement = require("../models/stockMovementModel");

// ========================
// WAREHOUSE ZONES CRUD
// ========================

// Create a new warehouse zone
async function createWarehouseZone(req, res) {
  try {
    const {
      name,
      code,
      capacity,
      temperature,
      humidity,
      description,
      location,
      maxTemperature,
      minTemperature,
      maxHumidity,
      minHumidity,
    } = req.body;

    const newZone = new WarehouseZone({
      name,
      code,
      capacity,
      temperature,
      humidity,
      description,
      location,
      maxTemperature,
      minTemperature,
      maxHumidity,
      minHumidity,
    });

    await newZone.save();
    res.status(201).json(newZone);
  } catch (error) {
    console.error("Error creating warehouse zone:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Zone name or code already exists" });
    }
    res.status(500).json({ error: "Failed to create warehouse zone" });
  }
}

// Get all warehouse zones
async function getAllWarehouseZones(req, res) {
  try {
    const zones = await WarehouseZone.find().sort({ name: 1 });
    
    // Calculate items count for each zone
    const zonesWithItems = await Promise.all(
      zones.map(async (zone) => {
        const itemCount = await Inventory.countDocuments({ zone: zone._id });
        return {
          ...zone.toObject(),
          items: itemCount,
          utilizationPercentage: zone.utilizationPercentage,
        };
      })
    );

    res.status(200).json(zonesWithItems);
  } catch (error) {
    console.error("Error fetching warehouse zones:", error);
    res.status(500).json({ error: "Failed to fetch warehouse zones" });
  }
}

// Get a specific warehouse zone by ID
async function getWarehouseZoneById(req, res) {
  try {
    const { id } = req.params;
    const zone = await WarehouseZone.findById(id);
    
    if (!zone) {
      return res.status(404).json({ error: "Warehouse zone not found" });
    }

    // Get items in this zone
    const items = await Inventory.find({ zone: id });
    const itemCount = items.length;

    res.status(200).json({
      ...zone.toObject(),
      items: itemCount,
      utilizationPercentage: zone.utilizationPercentage,
      inventoryItems: items,
    });
  } catch (error) {
    console.error("Error fetching warehouse zone:", error);
    res.status(500).json({ error: "Failed to fetch warehouse zone" });
  }
}

// Update a warehouse zone
async function updateWarehouseZone(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedZone = await WarehouseZone.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedZone) {
      return res.status(404).json({ error: "Warehouse zone not found" });
    }

    res.status(200).json(updatedZone);
  } catch (error) {
    console.error("Error updating warehouse zone:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Zone name or code already exists" });
    }
    res.status(500).json({ error: "Failed to update warehouse zone" });
  }
}

// Delete a warehouse zone
async function deleteWarehouseZone(req, res) {
  try {
    const { id } = req.params;

    // Check if zone has any items
    const itemCount = await Inventory.countDocuments({ zone: id });
    if (itemCount > 0) {
      return res.status(400).json({ 
        error: "Cannot delete zone with existing items. Please move items first." 
      });
    }

    const deletedZone = await WarehouseZone.findByIdAndDelete(id);
    
    if (!deletedZone) {
      return res.status(404).json({ error: "Warehouse zone not found" });
    }

    res.status(200).json({ message: "Warehouse zone deleted successfully" });
  } catch (error) {
    console.error("Error deleting warehouse zone:", error);
    res.status(500).json({ error: "Failed to delete warehouse zone" });
  }
}

// ========================
// STOCK MOVEMENTS CRUD
// ========================

// Create a stock movement
async function createStockMovement(req, res) {
  try {
    const {
      itemId,
      type,
      quantity,
      fromLocation,
      toLocation,
      fromZone,
      toZone,
      reason,
      operator,
      reference,
      notes,
    } = req.body;

    // Validate item exists
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    // Create movement record
    const movement = new StockMovement({
      itemId,
      itemName: item.name,
      type,
      quantity,
      fromLocation,
      toLocation,
      fromZone,
      toZone,
      reason,
      operator,
      reference,
      notes,
      unitPrice: item.unitPrice,
    });

    await movement.save();

    // Update inventory stock based on movement type
    if (type === "in") {
      item.currentStock += quantity;
      if (toZone && item.zone?.toString() !== toZone) {
        item.zone = toZone;
        item.location = toLocation;
      }
    } else if (type === "out") {
      if (item.currentStock < quantity) {
        return res.status(400).json({ error: "Insufficient stock" });
      }
      item.currentStock -= quantity;
    } else if (type === "transfer") {
      if (fromZone && toZone) {
        item.zone = toZone;
        item.location = toLocation;
      }
    } else if (type === "adjustment") {
      item.currentStock = quantity; // Set to exact quantity for adjustments
    }

    await item.save();

    // Update zone capacities
    if (fromZone && fromZone !== toZone) {
      await updateZoneCapacity(fromZone, -quantity);
    }
    if (toZone && fromZone !== toZone) {
      await updateZoneCapacity(toZone, quantity);
    }

    // Mark movement as completed
    movement.status = "completed";
    await movement.save();

    res.status(201).json(movement);
  } catch (error) {
    console.error("Error creating stock movement:", error);
    res.status(500).json({ error: "Failed to create stock movement" });
  }
}

// Helper function to update zone capacity
async function updateZoneCapacity(zoneId, quantityChange) {
  try {
    const zone = await WarehouseZone.findById(zoneId);
    if (zone) {
      zone.usedCapacity = Math.max(0, zone.usedCapacity + quantityChange);
      await zone.save();
    }
  } catch (error) {
    console.error("Error updating zone capacity:", error);
  }
}

// Get all stock movements
async function getAllStockMovements(req, res) {
  try {
    const { page = 1, limit = 50, type, itemId, startDate, endDate } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (itemId) filter.itemId = itemId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(filter)
      .populate("itemId", "name sku")
      .populate("fromZone", "name code")
      .populate("toZone", "name code")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StockMovement.countDocuments(filter);

    res.status(200).json({
      movements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ error: "Failed to fetch stock movements" });
  }
}

// ========================
// LOW STOCK ALERTS
// ========================

// Get low stock items
async function getLowStockItems(req, res) {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$currentStock", "$minStock"] }
    })
    .populate("zone", "name code")
    .sort({ currentStock: 1 });

    res.status(200).json(lowStockItems);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({ error: "Failed to fetch low stock items" });
  }
}

// Update low stock alert status
async function updateLowStockAlert(req, res) {
  try {
    const { id } = req.params;
    const { lowStockAlerted } = req.body;

    const item = await Inventory.findByIdAndUpdate(
      id,
      { lowStockAlerted },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Error updating low stock alert:", error);
    res.status(500).json({ error: "Failed to update low stock alert" });
  }
}

// ========================
// WAREHOUSE ANALYTICS
// ========================

// Get warehouse analytics
async function getWarehouseAnalytics(req, res) {
  try {
    // Total items and stock
    const totalItems = await Inventory.countDocuments();
    const totalStock = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$currentStock" } } }
    ]);

    // Low stock items count
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lte: ["$currentStock", "$minStock"] }
    });

    // Total value
    const totalValue = await Inventory.aggregate([
      { 
        $group: { 
          _id: null, 
          total: { $sum: { $multiply: ["$currentStock", "$unitPrice"] } } 
        } 
      }
    ]);

    // Zone utilization
    const zoneUtilization = await WarehouseZone.aggregate([
      {
        $project: {
          name: 1,
          capacity: 1,
          usedCapacity: 1,
          utilizationPercentage: {
            $cond: [
              { $gt: ["$capacity", 0] },
              { $multiply: [{ $divide: ["$usedCapacity", "$capacity"] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    // Recent movements (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentMovements = await StockMovement.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      totalItems,
      totalStock: totalStock[0]?.total || 0,
      lowStockCount,
      totalValue: totalValue[0]?.total || 0,
      zoneUtilization,
      recentMovements,
    });
  } catch (error) {
    console.error("Error fetching warehouse analytics:", error);
    res.status(500).json({ error: "Failed to fetch warehouse analytics" });
  }
}

module.exports = {
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
};