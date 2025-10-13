const Supplier = require("../models/Supplier");
const PurchaseOrder = require("../models/PurchaseOrder");
const ProcurementChangeRequest = require("../models/ProcurementChangeRequest");
const { hasLevelAtLeast } = require("../middleware/accessControl");

const isProcurementDepartment = (department = "") => {
  const normalized = department.trim().toLowerCase();
  return (
    normalized === "procurement" || normalized === "procurement department"
  );
};

const ensureProcurementRequester = (user) => {
  return (
    user && user.level === "L1" && isProcurementDepartment(user.department)
  );
};

const ensureProcurementApprover = (user) => {
  if (!user) return false;
  if (user.level === "L4") return true;
  return user.level === "L2" && isProcurementDepartment(user.department);
};

const calculateTotal = (items = []) =>
  items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) * Number(item.unitPrice || item.price || 0),
    0
  );

const createSupplierFromPayload = async (payload = {}) => {
  const supplier = new Supplier(payload);
  await supplier.save();
  return supplier;
};

const updateSupplierFromPayload = async (targetId, payload = {}) => {
  const supplier = await Supplier.findById(targetId);
  if (!supplier || supplier.deleted) {
    throw new Error("Supplier not found");
  }
  Object.assign(supplier, payload, { updatedAt: Date.now() });
  await supplier.save();
  return supplier;
};

const deleteSupplierById = async (targetId) => {
  const supplier = await Supplier.findById(targetId);
  if (!supplier || supplier.deleted) {
    throw new Error("Supplier not found");
  }
  supplier.deleted = true;
  supplier.updatedAt = Date.now();
  await supplier.save();
  return supplier;
};

const createPurchaseOrderFromPayload = async (payload = {}, requestedBy) => {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const totalAmount = calculateTotal(items);

  const po = new PurchaseOrder({
    poNumber: payload.poNumber,
    supplier: payload.supplier,
    items: items.map((item) => ({
      materialName: item.materialName || item.material,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice ?? item.price),
    })),
    totalAmount,
    status: "Pending",
    createdBy: requestedBy?._id || requestedBy,
    notes: payload.notes || "",
  });

  await po.save();
  return await PurchaseOrder.findById(po._id)
    .populate("supplier", "name code")
    .populate("createdBy", "name email level");
};

const updatePurchaseOrderFromPayload = async (targetId, payload = {}, user) => {
  const po = await PurchaseOrder.findById(targetId);
  if (!po) {
    throw new Error("Purchase order not found");
  }

  if (payload.items) {
    po.items = payload.items.map((item) => ({
      materialName: item.materialName || item.material,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice ?? item.price),
    }));
    po.totalAmount = calculateTotal(po.items);
  }

  if (typeof payload.notes === "string") {
    po.notes = payload.notes;
  }

  if (payload.status && payload.status !== po.status) {
    if (!hasLevelAtLeast(user, "L2")) {
      throw new Error("Only directors can change purchase order status");
    }
    if (!["Pending", "Approved", "Delivered"].includes(payload.status)) {
      throw new Error("Invalid status value");
    }
    po.status = payload.status;
    if (po.status === "Approved") {
      po.approvedBy = user._id;
      po.approvedAt = new Date();
      po.approvalNotes = payload.approvalNotes || po.approvalNotes;
    }
    if (po.status === "Delivered") {
      po.deliveredAt = new Date();
    }
  }

  await po.save();
  return await PurchaseOrder.findById(po._id)
    .populate("supplier", "name code")
    .populate("createdBy", "name email level")
    .populate("approvedBy", "name email level");
};

const deletePurchaseOrderById = async (targetId) => {
  const po = await PurchaseOrder.findById(targetId);
  if (!po) {
    throw new Error("Purchase order not found");
  }
  if (po.invoice) {
    throw new Error(
      "Cannot delete a purchase order that already has an invoice"
    );
  }
  if (po.status !== "Pending") {
    throw new Error("Only pending purchase orders can be deleted");
  }
  await po.deleteOne();
  return po;
};

const submitProcurementChangeRequest = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureProcurementRequester(user)) {
      return res.status(403).json({
        error:
          "Only Procurement Managers (L1) can submit procurement change requests",
      });
    }

    const { entityType, actionType, targetId, payload, reason } =
      req.body || {};

    if (!entityType || !["supplier", "purchaseOrder"].includes(entityType)) {
      return res.status(400).json({ error: "Invalid entity type" });
    }

    if (!actionType || !["create", "update", "delete"].includes(actionType)) {
      return res.status(400).json({ error: "Invalid action type" });
    }

    if (
      (actionType === "update" || actionType === "delete") &&
      (!targetId || !targetId.trim())
    ) {
      return res
        .status(400)
        .json({ error: "targetId is required for update/delete actions" });
    }

    if (entityType === "supplier") {
      if (actionType === "create") {
        const supplierCode = payload?.code;
        if (supplierCode) {
          const codeExists = await Supplier.exists({ code: supplierCode });
          if (codeExists) {
            return res
              .status(409)
              .json({ error: "Supplier code already exists" });
          }
        }
      } else {
        const supplierExists = await Supplier.exists({
          _id: targetId,
          deleted: false,
        });
        if (!supplierExists) {
          return res.status(404).json({ error: "Supplier not found" });
        }
      }
    }

    if (entityType === "purchaseOrder" && actionType !== "create") {
      const poExists = await PurchaseOrder.exists({ _id: targetId });
      if (!poExists) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
    }

    const request = await ProcurementChangeRequest.create({
      entityType,
      actionType,
      targetId: targetId || null,
      payload: payload || {},
      requestedBy: user._id,
      requestedByName: user.name,
      requestedByLevel: user.level,
      requestedByDepartment: user.department,
      approvalNote: reason || null,
    });

    res.status(201).json({
      message: "Procurement change request submitted for director approval",
      request,
    });
  } catch (error) {
    console.error("submitProcurementChangeRequest error", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to submit request" });
  }
};

const getProcurementChangeRequests = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const filter = {};
    const { status } = req.query || {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    if (user.level === "L1") {
      filter.requestedBy = user._id;
    } else if (!ensureProcurementApprover(user)) {
      return res.status(403).json({
        error: "You do not have permission to view procurement change requests",
      });
    }

    const requests = await ProcurementChangeRequest.find(filter)
      .populate("requestedBy", "name email level department")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error("getProcurementChangeRequests error", error);
    res.status(500).json({ error: error.message || "Failed to load requests" });
  }
};

const approveProcurementChangeRequest = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureProcurementApprover(user)) {
      return res.status(403).json({
        error:
          "Only Procurement Directors (L2) or Admins (L4) can approve requests",
      });
    }

    const { id } = req.params;
    const { approvalNote } = req.body || {};
    const request = await ProcurementChangeRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Change request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    let result;

    if (request.entityType === "supplier") {
      if (request.actionType === "create") {
        result = await createSupplierFromPayload(request.payload);
      } else if (request.actionType === "update") {
        result = await updateSupplierFromPayload(
          request.targetId,
          request.payload
        );
      } else if (request.actionType === "delete") {
        result = await deleteSupplierById(request.targetId);
      }
    }

    if (request.entityType === "purchaseOrder") {
      if (request.actionType === "create") {
        result = await createPurchaseOrderFromPayload(
          request.payload,
          request.requestedBy
        );
      } else if (request.actionType === "update") {
        result = await updatePurchaseOrderFromPayload(
          request.targetId,
          request.payload,
          user
        );
      } else if (request.actionType === "delete") {
        result = await deletePurchaseOrderById(request.targetId);
      }
    }

    request.status = "approved";
    request.approvedBy = user._id;
    request.approvedByName = user.name;
    request.approvalNote = approvalNote || request.approvalNote;
    await request.save();

    res.json({
      message: "Request approved and applied successfully",
      result,
      request,
    });
  } catch (error) {
    console.error("approveProcurementChangeRequest error", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to approve request" });
  }
};

const rejectProcurementChangeRequest = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureProcurementApprover(user)) {
      return res.status(403).json({
        error:
          "Only Procurement Directors (L2) or Admins (L4) can reject requests",
      });
    }

    const { id } = req.params;
    const { approvalNote } = req.body || {};
    const request = await ProcurementChangeRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Change request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    request.status = "rejected";
    request.approvedBy = user._id;
    request.approvedByName = user.name;
    request.approvalNote = approvalNote || request.approvalNote;
    await request.save();

    res.json({
      message: "Request rejected",
      request,
    });
  } catch (error) {
    console.error("rejectProcurementChangeRequest error", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to reject request" });
  }
};

module.exports = {
  submitProcurementChangeRequest,
  getProcurementChangeRequests,
  approveProcurementChangeRequest,
  rejectProcurementChangeRequest,
  ensureProcurementRequester,
  ensureProcurementApprover,
  isProcurementDepartment,
};
