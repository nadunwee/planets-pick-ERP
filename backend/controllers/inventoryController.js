const Inventory = require("../models/inventoryModel.js");

// Add a new inventory item
async function addInventoryItem(req, res) {
  const { name, type, availability, currentStock, minStock, unitPrice } =
    req.body;

  try {
    const newItem = new Inventory({
      name,
      type,
      availability,
      currentStock,
      minStock,
      unitPrice,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding inventory item:", error);
    res.status(500).json({ error: "Failed to add inventory item" });
  }
}

// Edit inventory item (name, type, unit price)
async function editInventoryItem(req, res) {
  const { id } = req.params;
  const { name, type, unitPrice } = req.body;

  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      { name, type, unitPrice },
      { new: true } // return updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error editing inventory item:", error);
    res.status(500).json({ error: "Failed to edit inventory item" });
  }
}

// Update stock (current stock)
async function updateStock(req, res) {
  const { id } = req.params;
  const { currentStock } = req.body;

  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      { currentStock },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
}

// Get all inventory items
async function getAllInventory(req, res) {
  try {
    const items = await Inventory.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
}

module.exports = {
  addInventoryItem,
  editInventoryItem,
  updateStock,
  getAllInventory,
};
