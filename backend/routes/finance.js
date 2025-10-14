const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

router.use(requireAuth);

// --- Transactions ---
// Get all transactions - L3, L4, and L5 (Finance Manager, Admin, and Super Admin)
router.get("/transactions", allowLevels("L3", "L4", "L5"), financeController.getTransactions);

// Add a new transaction - L3, L4, and L5 only
router.post("/transactions", allowLevels("L3", "L4", "L5"), financeController.addTransaction);

// Approve or reject a transaction - L4 and L5 only
router.patch("/transactions/:id/approve", allowLevels("L4", "L5"), financeController.approveTransaction);

// Edit/update a transaction by ID - L3, L4, and L5 only
router.put("/transactions/:id", allowLevels("L3", "L4", "L5"), financeController.updateTransaction);

// Delete a transaction by ID - L3, L4, and L5 only
router.delete("/transactions/:id", allowLevels("L3", "L4", "L5"), financeController.deleteTransaction);

// --- Accounts ---
router.get("/accounts", allowLevels("L3", "L4", "L5"), financeController.getAccounts);

// --- Budgets ---
router.get("/budgets", allowLevels("L3", "L4", "L5"), financeController.getBudgets);

// --- Assets & Liabilities ---
// Get all assets & liabilities - L3, L4, and L5 only
router.get("/assets-liabilities", allowLevels("L3", "L4", "L5"), financeController.getAssetsLiabilities);

// Add a new asset/liability - L3, L4, and L5 only
router.post("/assets-liabilities", allowLevels("L3", "L4", "L5"), financeController.addAssetLiability);

// Update an asset/liability by ID - L3, L4, and L5 only
router.put("/assets-liabilities/:id", allowLevels("L3", "L4", "L5"), financeController.updateAssetLiability);

// Delete an asset/liability by ID - L3, L4, and L5 only
router.delete(
  "/assets-liabilities/:id",
  allowLevels("L3", "L4", "L5"),
  financeController.deleteAssetLiability
);

module.exports = router;
