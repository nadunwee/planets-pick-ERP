const PurchaseOrder = require("../models/PurchaseOrder");
const { hasLevelAtLeast } = require("../middleware/accessControl");
const {
  ensureProcurementRequester,
} = require("./procurementApprovalController");

// Helper to calculate total amount
const calculateTotal = (items = []) =>
  items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );

const populatePurchaseOrder = (query) =>
  query
    .populate("supplier", "name code")
    .populate("invoice", "invoiceNumber status totalAmount")
    .populate("createdBy", "name email level")
    .populate("approvedBy", "name email level");

// List all POs
const listPOs = async (req, res) => {
  try {
    const orders = await populatePurchaseOrder(
      PurchaseOrder.find().sort({ createdAt: -1 })
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single PO
const getPO = async (req, res) => {
  try {
    const order = await populatePurchaseOrder(
      PurchaseOrder.findById(req.params.id)
    );
    if (!order) {
      return res.status(404).json({ error: "Purchase order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create PO
const createPO = async (req, res) => {
  try {
    if (ensureProcurementRequester(req.user)) {
      return res.status(403).json({
        error:
          "Procurement managers (L1) must submit purchase order changes for director approval.",
      });
    }

    const { poNumber, supplier, items, status, notes = "" } = req.body || {};

    if (!poNumber || !supplier || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error:
          "Purchase order requires a number, supplier, and at least one item",
      });
    }

    const totalAmount = calculateTotal(items);

    let computedStatus = "Pending";
    if (status && ["Pending", "Approved", "Delivered"].includes(status)) {
      if (status === "Pending" || hasLevelAtLeast(req.user, "L2")) {
        computedStatus = status;
      } else {
        return res.status(403).json({
          error: "Only directors can create pre-approved purchase orders",
        });
      }
    }

    const po = new PurchaseOrder({
      poNumber,
      supplier,
      items,
      totalAmount,
      status: computedStatus,
      createdBy: req.user?._id,
      notes,
    });

    if (computedStatus === "Approved") {
      po.approvedBy = req.user._id;
      po.approvedAt = new Date();
    }

    if (computedStatus === "Delivered") {
      po.deliveredAt = new Date();
    }

    await po.save();
    const savedPO = await populatePurchaseOrder(PurchaseOrder.findById(po._id));
    res.status(201).json(savedPO);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update PO
const updatePO = async (req, res) => {
  try {
    if (ensureProcurementRequester(req.user)) {
      return res.status(403).json({
        error:
          "Procurement managers (L1) must submit purchase order changes for director approval.",
      });
    }

    const updates = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updates, "invoice")) {
      delete updates.invoice;
    }

    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    const userId = req.user?._id?.toString();
    const createdBy = po.createdBy ? po.createdBy.toString() : null;
    const isCreator = createdBy && userId === createdBy;
    const isDirectorPlus = hasLevelAtLeast(req.user, "L2");

    if (!isCreator && !isDirectorPlus) {
      return res.status(403).json({
        error: "Only the creator or a director can update this purchase order",
      });
    }

    if (!isDirectorPlus && po.status !== "Pending") {
      return res
        .status(403)
        .json({ error: "Only directors can change non-pending orders" });
    }

    if (updates.items) {
      po.items = updates.items;
      po.totalAmount = calculateTotal(updates.items);
    }

    if (typeof updates.notes === "string") {
      po.notes = updates.notes;
    }

    if (updates.status && updates.status !== po.status) {
      if (!isDirectorPlus) {
        return res.status(403).json({
          error: "Only directors can change the status of purchase orders",
        });
      }

      if (!["Pending", "Approved", "Delivered"].includes(updates.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      if (updates.status === "Approved") {
        if (po.status !== "Pending") {
          return res
            .status(400)
            .json({ error: "Only pending orders can be approved" });
        }
        po.status = "Approved";
        po.approvedBy = req.user._id;
        po.approvedAt = new Date();
        po.approvalNotes = updates.approvalNotes || po.approvalNotes;
      } else if (updates.status === "Delivered") {
        if (po.status === "Pending") {
          return res
            .status(400)
            .json({ error: "Order must be approved before delivery" });
        }
        po.status = "Delivered";
        po.deliveredAt = new Date();
      } else if (updates.status === "Pending") {
        po.status = "Pending";
        po.approvedBy = undefined;
        po.approvedAt = undefined;
        po.approvalNotes = "";
        po.deliveredAt = undefined;
      }
    }

    await po.save();

    const refreshed = await populatePurchaseOrder(
      PurchaseOrder.findById(po._id)
    );
    res.json(refreshed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete PO
const deletePO = async (req, res) => {
  try {
    if (ensureProcurementRequester(req.user)) {
      return res.status(403).json({
        error:
          "Procurement managers (L1) must submit purchase order changes for director approval.",
      });
    }

    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    const userId = req.user?._id?.toString();
    const createdBy = po.createdBy ? po.createdBy.toString() : null;
    const isDirectorPlus = hasLevelAtLeast(req.user, "L2");

    if (!isDirectorPlus && (!createdBy || createdBy !== userId)) {
      return res.status(403).json({
        error: "Only the creator or a director can delete this purchase order",
      });
    }

    if (po.invoice) {
      return res.status(400).json({
        error: "Cannot delete a purchase order that already has an invoice",
      });
    }

    if (po.status !== "Pending") {
      return res
        .status(400)
        .json({ error: "Only pending purchase orders can be deleted" });
    }

    await po.deleteOne();
    res.json({ message: "Purchase order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const approvePO = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalNotes = "" } = req.body || {};

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    if (po.status !== "Pending") {
      return res
        .status(400)
        .json({ error: "Only pending orders can be approved" });
    }

    po.status = "Approved";
    po.approvedBy = req.user._id;
    po.approvedAt = new Date();
    po.approvalNotes = approvalNotes;

    await po.save();

    const refreshed = await populatePurchaseOrder(PurchaseOrder.findById(id));
    res.json(refreshed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markDelivered = async (req, res) => {
  try {
    const { id } = req.params;

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    if (po.status !== "Approved") {
      return res.status(400).json({
        error: "Purchase order must be approved before marking delivered",
      });
    }

    po.status = "Delivered";
    po.deliveredAt = new Date();

    await po.save();

    const refreshed = await populatePurchaseOrder(PurchaseOrder.findById(id));
    res.json(refreshed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  listPOs,
  getPO,
  createPO,
  updatePO,
  deletePO,
  approvePO,
  markDelivered,
};
