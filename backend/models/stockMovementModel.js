const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const stockMovementSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["in", "out", "transfer", "adjustment"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    fromLocation: {
      type: String,
    },
    toLocation: {
      type: String,
    },
    fromZone: {
      type: Schema.Types.ObjectId,
      ref: "WarehouseZone",
    },
    toZone: {
      type: Schema.Types.ObjectId,
      ref: "WarehouseZone",
    },
    reason: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    unitPrice: {
      type: Number,
      min: 0,
    },
    totalValue: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate total value
stockMovementSchema.pre("save", function (next) {
  if (this.unitPrice && this.quantity) {
    this.totalValue = this.unitPrice * this.quantity;
  }
  next();
});

// Index for better query performance
stockMovementSchema.index({ itemId: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1, createdAt: -1 });
stockMovementSchema.index({ fromZone: 1, toZone: 1 });

module.exports = mongoose.model("StockMovement", stockMovementSchema);