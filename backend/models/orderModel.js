const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    notes: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    orderedOn: { type: Date, required: true },
    expectedDate: { type: Date },
    priority: {
      type: String,
      default: "medium",
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending",
    },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "unpaid",
    },
    paymentMethod: { type: String },
    shippingMethod: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
