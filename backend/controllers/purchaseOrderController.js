const PurchaseOrder = require("../models/PurchaseOrder");

// Helper to calculate total amount
const calculateTotal = (items) => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

// List all POs
const listPOs = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name code")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single PO
const getPO = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate("supplier", "name code");
    if (!order) return res.status(404).json({ error: "PO not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create PO
const createPO = async (req, res) => {
  try {
    const { poNumber, supplier, items, status } = req.body;
    if (!poNumber || !supplier || !items?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const totalAmount = calculateTotal(items);

    const po = new PurchaseOrder({
      poNumber,
      supplier,
      items,
      totalAmount,
      status: status || "Pending",
      createdBy: req.user?._id,
    });

    await po.save();
    const savedPO = await po.populate("supplier", "name code");
    res.status(201).json(savedPO);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update PO
const updatePO = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.items) {
      updates.totalAmount = calculateTotal(updates.items);
    }
    const po = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate("supplier", "name code");
    if (!po) return res.status(404).json({ error: "PO not found" });
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete PO
const deletePO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ error: "PO not found" });
    if (po.status !== "Pending") {
      return res.status(400).json({ error: "Only Pending POs can be deleted" });
    }
    await po.deleteOne();
    res.json({ message: "PO deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listPOs, getPO, createPO, updatePO, deletePO };
