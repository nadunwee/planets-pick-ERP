const mongoose = require("mongoose");

const procurementChangeRequestSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["supplier", "purchaseOrder"],
      required: true,
    },
    actionType: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedByName: {
      type: String,
      required: true,
    },
    requestedByLevel: {
      type: String,
      required: true,
    },
    requestedByDepartment: {
      type: String,
      required: true,
    },
    approvalNote: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedByName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ProcurementChangeRequest",
  procurementChangeRequestSchema
);
