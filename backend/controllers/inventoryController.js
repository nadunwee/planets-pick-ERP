const Inventory = require("../models/inventoryModel.js");
const WarehouseZone = require("../models/warehouseZoneModel.js");

// Add a new inventory item
async function addInventoryItem(req, res) {
  try {
    const {
      name,
      sku,
      type,
      category,
      availability,
      currentStock,
      minStock,
      maxStock,
      unitPrice,
      unit,
      zone,
      location,
      rack,
      shelf,
      supplier,
      expiryDate,
      temperature,
      humidity,
      condition,
      notes,
    } = req.body;

    // Validate zone exists if provided
    if (zone) {
      const zoneExists = await WarehouseZone.findById(zone);
      if (!zoneExists) {
        return res.status(400).json({ error: "Invalid warehouse zone" });
      }
    }

    const newItem = new Inventory({
      name,
      sku,
      type,
      category,
      availability,
      currentStock,
      minStock,
      maxStock,
      unitPrice,
      unit,
      zone,
      location,
      rack,
      shelf,
      supplier,
      expiryDate,
      temperature,
      humidity,
      condition,
      notes,
      lastRestockDate: currentStock > 0 ? new Date() : undefined,
    });

    await newItem.save();

    // Update zone used capacity if zone is specified
    if (zone && currentStock > 0) {
      await WarehouseZone.findByIdAndUpdate(
        zone,
        { $inc: { usedCapacity: currentStock } }
      );
    }

    // Populate zone information in response
    const populatedItem = await Inventory.findById(newItem._id).populate("zone", "name code");
    res.status(201).json(populatedItem);
  } catch (error) {
    console.error("Error adding inventory item:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "SKU already exists" });
    }
    res.status(500).json({ error: "Failed to add inventory item" });
  }
}

// Edit inventory item (name, type, unit price, etc.)
async function editInventoryItem(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If zone is being updated, validate it exists
    if (updateData.zone) {
      const zoneExists = await WarehouseZone.findById(updateData.zone);
      if (!zoneExists) {
        return res.status(400).json({ error: "Invalid warehouse zone" });
      }
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("zone", "name code");

    if (!updatedItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error editing inventory item:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "SKU already exists" });
    }
    res.status(500).json({ error: "Failed to edit inventory item" });
  }
}

// Update stock (current stock)
async function updateStock(req, res) {
  try {
    const { id } = req.params;
    const { currentStock } = req.body;

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    const oldStock = item.currentStock;
    const stockDifference = currentStock - oldStock;

    // Update item stock
    item.currentStock = currentStock;
    if (currentStock > oldStock) {
      item.lastRestockDate = new Date();
    }
    await item.save();

    // Update zone capacity if item has a zone
    if (item.zone && stockDifference !== 0) {
      await WarehouseZone.findByIdAndUpdate(
        item.zone,
        { $inc: { usedCapacity: stockDifference } }
      );
    }

    const populatedItem = await Inventory.findById(id).populate("zone", "name code");
    res.status(200).json(populatedItem);
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
}

// Get all inventory items
async function getAllInventory(req, res) {
  try {
    const { zone, category, status, lowStock } = req.query;
    
    const filter = {};
    if (zone) filter.zone = zone;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (lowStock === 'true') {
      filter.$expr = { $lte: ["$currentStock", "$minStock"] };
    }

    const items = await Inventory.find(filter)
      .populate("zone", "name code temperature humidity")
      .sort({ name: 1 });

    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
}

// Get single inventory item
async function getInventoryItem(req, res) {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id).populate("zone", "name code temperature humidity");
    
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({ error: "Failed to fetch inventory item" });
  }
}

// Delete inventory item
async function deleteInventoryItem(req, res) {
  try {
    const { id } = req.params;
    
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    // Update zone capacity before deleting
    if (item.zone && item.currentStock > 0) {
      await WarehouseZone.findByIdAndUpdate(
        item.zone,
        { $inc: { usedCapacity: -item.currentStock } }
      );
    }

    await Inventory.findByIdAndDelete(id);
    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
}

module.exports = {
  addInventoryItem,
  editInventoryItem,
  updateStock,
  getAllInventory,
  getInventoryItem,
  deleteInventoryItem,
};
