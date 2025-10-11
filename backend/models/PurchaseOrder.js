const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  items: [
    {
      materialName: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Delivered"],
    default: "Pending",
  },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: { type: String, default: "" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  approvalNotes: { type: String, default: "" },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

purchaseOrderSchema.pre("save", function save(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
