const {
  Transaction,
  Account,
  Budget,
  AssetLiability,
} = require("../models/financeModel");

// --- Transactions ---

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new transaction
exports.addTransaction = async (req, res) => {
  try {
    const { type, category, description, amount, account, reference, date } =
      req.body;

    if (!type || !category || !description || !amount || !account || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTransaction = new Transaction({
      type,
      category,
      description,
      amount: Number(amount),
      account,
      reference,
      date: new Date(date),
      status: "completed",
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    console.error("❌ Add transaction error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update an existing transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.amount) updateData.amount = Number(updateData.amount);
    if (updateData.date) updateData.date = new Date(updateData.date);

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedTransaction)
      return res.status(404).json({ error: "Transaction not found" });

    res.json(updatedTransaction);
  } catch (err) {
    console.error("❌ Update transaction error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction)
      return res.status(404).json({ error: "Transaction not found" });

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("❌ Delete transaction error:", err);
    res.status(500).json({ error: err.message });
  }
};

// --- Accounts ---
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Budgets ---
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Assets & Liabilities ---

// Get all assets & liabilities
exports.getAssetsLiabilities = async (req, res) => {
  try {
    const items = await AssetLiability.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new asset/liability
exports.addAssetLiability = async (req, res) => {
  try {
    const { type, category, description, amount, date } = req.body;

    if (!type || !category || !description || !amount || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newItem = new AssetLiability({
      type, // "asset" or "liability"
      category, // "current" or "non-current"
      description,
      amount: Number(amount),
      date: new Date(date),
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("❌ Add asset/liability error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update asset/liability
exports.updateAssetLiability = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.amount) updateData.amount = Number(updateData.amount);
    if (updateData.date) updateData.date = new Date(updateData.date);

    const updatedItem = await AssetLiability.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedItem)
      return res.status(404).json({ error: "Asset/Liability not found" });

    res.json(updatedItem);
  } catch (err) {
    console.error("❌ Update asset/liability error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete asset/liability
exports.deleteAssetLiability = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await AssetLiability.findByIdAndDelete(id);

    if (!deletedItem)
      return res.status(404).json({ error: "Asset/Liability not found" });

    res.json({ message: "Asset/Liability deleted successfully" });
  } catch (err) {
    console.error("❌ Delete asset/liability error:", err);
    res.status(500).json({ error: err.message });
  }
};
