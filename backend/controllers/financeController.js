const {
  Transaction,
  Account,
  Budget,
  AssetLiability,
} = require("../models/financeModel");

// Mock data for testing when database is not available
let mockTransactions = [];
let mockAccounts = [];
let mockBudgets = [];
let mockAssetsLiabilities = [];
let mockIdCounter = 1;

// Helper to check if database is connected
const isDatabaseConnected = () => {
  return require("mongoose").connection.readyState === 1;
};

// --- Transactions ---

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    console.log("📋 Getting transactions...");
    
    if (!isDatabaseConnected()) {
      console.log("⚠️ Database not connected, returning mock data");
      return res.json(mockTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    
    console.log("💾 Fetching from MongoDB...");
    const transactions = await Transaction.find().sort({ date: -1 });
    console.log(`✅ Found ${transactions.length} transactions in MongoDB`);
    res.json(transactions);
  } catch (err) {
    console.error("❌ Get transactions error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add a new transaction
exports.addTransaction = async (req, res) => {
  try {
    const { type, category, description, amount, account, reference, date } =
      req.body;

    console.log("📝 Adding transaction:", { type, category, description, amount, account });

    if (!type || !category || !description || !amount || !account || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!isDatabaseConnected()) {
      console.log("⚠️ Database not connected, using mock data");
      const mockTransaction = {
        _id: (mockIdCounter++).toString(),
        type,
        category,
        description,
        amount: Number(amount),
        account,
        reference,
        date: new Date(date).toISOString(),
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockTransactions.push(mockTransaction);
      console.log("✅ Mock transaction created:", mockTransaction._id);
      return res.status(201).json(mockTransaction);
    }

    console.log("💾 Saving to MongoDB...");
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
    console.log("✅ Transaction saved to MongoDB:", newTransaction._id);
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
    if (!isDatabaseConnected()) {
      return res.json(mockAssetsLiabilities.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    
    const items = await AssetLiability.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new asset/liability
exports.addAssetLiability = async (req, res) => {
  try {
    const { type, subtype, name, value, date } = req.body;

    if (!type || !subtype || !name || !value) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!isDatabaseConnected()) {
      // Mock implementation for testing
      const mockItem = {
        _id: (mockIdCounter++).toString(),
        type, // "asset" or "liability"
        subtype, // "current" or "non-current"
        name,
        value: Number(value),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        status: "active"
      };
      
      mockAssetsLiabilities.push(mockItem);
      return res.status(201).json(mockItem);
    }

    const newItem = new AssetLiability({
      type, // "asset" or "liability"
      subtype, // "current" or "non-current"
      name,
      value: Number(value),
      date: date ? new Date(date) : new Date(),
      status: "active"
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

    if (updateData.value) updateData.value = Number(updateData.value);
    if (updateData.date) updateData.date = new Date(updateData.date);

    if (!isDatabaseConnected()) {
      const itemIndex = mockAssetsLiabilities.findIndex(item => item._id === id);
      if (itemIndex === -1) return res.status(404).json({ error: "Asset/Liability not found" });
      
      // Convert date to ISO string for mock data
      if (updateData.date) updateData.date = updateData.date.toISOString();
      
      mockAssetsLiabilities[itemIndex] = { ...mockAssetsLiabilities[itemIndex], ...updateData };
      return res.json(mockAssetsLiabilities[itemIndex]);
    }

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

    if (!isDatabaseConnected()) {
      const itemIndex = mockAssetsLiabilities.findIndex(item => item._id === id);
      if (itemIndex === -1) return res.status(404).json({ error: "Asset/Liability not found" });
      
      mockAssetsLiabilities.splice(itemIndex, 1);
      return res.json({ message: "Asset/Liability deleted successfully" });
    }

    const deletedItem = await AssetLiability.findByIdAndDelete(id);

    if (!deletedItem)
      return res.status(404).json({ error: "Asset/Liability not found" });

    res.json({ message: "Asset/Liability deleted successfully" });
  } catch (err) {
    console.error("❌ Delete asset/liability error:", err);
    res.status(500).json({ error: err.message });
  }
};
