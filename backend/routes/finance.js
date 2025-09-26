const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");

// --- Transactions ---
// Get all transactions
router.get("/transactions", financeController.getTransactions);

// Add a new transaction
router.post("/transactions", financeController.addTransaction);

// Edit/update a transaction by ID
router.put("/transactions/:id", financeController.updateTransaction);

// Delete a transaction by ID
router.delete("/transactions/:id", financeController.deleteTransaction);

// --- Accounts ---
router.get("/accounts", financeController.getAccounts);

// --- Budgets ---
router.get("/budgets", financeController.getBudgets);

// --- Assets & Liabilities ---
// Get all assets & liabilities
router.get("/assets-liabilities", financeController.getAssetsLiabilities);

// Add a new asset/liability
router.post("/assets-liabilities", financeController.addAssetLiability);

// Update an asset/liability by ID
router.put("/assets-liabilities/:id", financeController.updateAssetLiability);

// Delete an asset/liability by ID
router.delete(
  "/assets-liabilities/:id",
  financeController.deleteAssetLiability
);

module.exports = router;
