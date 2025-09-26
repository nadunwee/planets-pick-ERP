const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  country: { type: String },
  category: { type: String, default: "N/A" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  // KPI fields
  onTimeDeliveryRate: { type: Number, default: 0 },
  qualityScore: { type: Number, default: 0 },
  responsivenessScore: { type: Number, default: 0 },
  totalSpend: { type: Number, default: 0 },
  ordersCount: { type: Number, default: 0 },
  // meta
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

SupplierSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Supplier', SupplierSchema);
