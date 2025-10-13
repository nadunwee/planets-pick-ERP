const mongoose = require("mongoose");

const { Schema } = mongoose;

const employeeChangeRequestSchema = new Schema(
  {
    actionType: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
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
  "EmployeeChangeRequest",
  employeeChangeRequestSchema
);
