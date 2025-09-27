const mongoose = require("mongoose");

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  account: { type: String, required: true },
  reference: { type: String },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["completed", "pending", "failed"],
    default: "completed",
  },
});

// Account Schema
const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["checking", "savings", "credit", "investment"],
    required: true,
  },
  balance: { type: Number, required: true },
  currency: { type: String, default: "LKR" },
  bank: { type: String },
  accountNumber: { type: String },
});

// Budget Schema
const budgetSchema = new mongoose.Schema({
  category: { type: String, required: true },
  allocated: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  period: {
    type: String,
    enum: ["monthly", "quarterly", "yearly"],
    required: true,
  },
});

// Asset / Liability Schema
const assetLiabilitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["asset", "liability"],
      required: true,
    },
    subtype: {
      type: String,
      enum: ["current", "non-current"],
      required: true,
    },
    name: { type: String, required: true },
    value: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "sold", "settled"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = {
  Transaction: mongoose.model("Transaction", transactionSchema),
  Account: mongoose.model("Account", accountSchema),
  Budget: mongoose.model("Budget", budgetSchema),
  AssetLiability: mongoose.model("AssetLiability", assetLiabilitySchema),
};
