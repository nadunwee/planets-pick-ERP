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

module.exports = router;
