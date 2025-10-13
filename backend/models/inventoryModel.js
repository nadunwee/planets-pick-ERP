const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const inventorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
    },
    minStock: {
      type: Number,
      required: true,
      default: 0,
    },
    maxStock: {
      type: Number,
      default: 0,
    },
    reorderPoint: {
      type: Number,
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      default: "units",
    },
    sku: {
      type: String,
    },
    barcode: {
      type: String,
    },
    batchNumber: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    manufacturingDate: {
      type: Date,
    },
    supplier: {
      name: String,
      contact: String,
      email: String,
    },
    location: {
      zone: String,
      rack: String,
      shelf: String,
    },
    valuationMethod: {
      type: String,
      enum: ["FIFO", "LIFO", "Average"],
      default: "FIFO",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
