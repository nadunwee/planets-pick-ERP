const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const inventorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    category: {
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
      min: 0,
    },
    minStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      default: 1000,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: "units",
    },
    // Warehouse location details
    zone: {
      type: Schema.Types.ObjectId,
      ref: "WarehouseZone",
    },
    location: {
      type: String,
    },
    rack: {
      type: String,
    },
    shelf: {
      type: String,
    },
    // Additional details
    supplier: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    temperature: {
      type: String,
    },
    humidity: {
      type: String,
    },
    status: {
      type: String,
      enum: ["in-stock", "low-stock", "out-of-stock", "expired"],
      default: "in-stock",
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: "good",
    },
    notes: {
      type: String,
    },
    lowStockAlerted: {
      type: Boolean,
      default: false,
    },
    lastRestockDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Virtual for checking if item is low stock
inventorySchema.virtual("isLowStock").get(function () {
  return this.currentStock <= this.minStock;
});

// Virtual for stock status calculation
inventorySchema.virtual("calculatedStatus").get(function () {
  if (this.currentStock === 0) return "out-of-stock";
  if (this.currentStock <= this.minStock) return "low-stock";
  if (this.expiryDate && this.expiryDate < new Date()) return "expired";
  return "in-stock";
});

// Pre-save middleware to update status
inventorySchema.pre("save", function (next) {
  this.status = this.calculatedStatus;
  next();
});

// Index for better query performance
inventorySchema.index({ zone: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ category: 1 });

module.exports = mongoose.model("Inventory", inventorySchema);
