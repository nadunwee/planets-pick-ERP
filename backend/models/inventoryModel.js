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
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
