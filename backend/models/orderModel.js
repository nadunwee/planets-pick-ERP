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
    actualDelivery: { type: Date },
    priority: {
      type: String,
      default: "medium",
    },
    status: {
      type: String,
      default: "pending",
    },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "fixed" },
    tax: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      default: "unpaid",
    },
    paymentMethod: { type: String },
    paymentRecords: [{
      amount: Number,
      method: String,
      reference: String,
      date: Date,
      notes: String,
    }],
    shippingMethod: { type: String },
    trackingNumber: { type: String },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    notes: { type: String },
    orderHistory: [{
      status: String,
      updatedBy: String,
      timestamp: Date,
      notes: String,
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
