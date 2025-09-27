const Production = require("../models/ProductionModel");

// Mock data for testing when database is not available
let mockBatches = [];
let mockIdCounter = 1;

// Helper to check if database is connected
const isDatabaseConnected = () => {
  return require("mongoose").connection.readyState === 1;
};

// ✅ Create new batch
const createBatch = async (req, res) => {
  try {
    const { 
      batchName, 
      product, 
      quantity, 
      operator,
      estimatedTime,
      startTime,
      quality,
      targetYield
    } = req.body;

    if (!isDatabaseConnected()) {
      // Mock implementation for testing
      const mockBatch = {
        _id: (mockIdCounter++).toString(),
        batchName,
        product,
        quantity: targetYield || quantity,
        targetYield: targetYield || quantity,
        operator,
        estimatedTime: estimatedTime || "1 hour",
        startTime: startTime || new Date().toISOString(),
        quality: quality || "good",
        status: "idle",
        processStatus: "getting-raw-materials",
        progress: 0,
        yield: 0,
        level: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockBatches.push(mockBatch);
      return res.status(201).json(mockBatch);
    }

    const batch = new Production({
      batchName,
      product,
      quantity: targetYield || quantity,
      targetYield: targetYield || quantity,
      operator,
      estimatedTime: estimatedTime || "1 hour",
      startTime: startTime || new Date().toISOString(),
      quality: quality || "good",
    });

    await batch.save();
    res.status(201).json(batch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Get all batches
const getBatches = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(mockBatches);
    }
    
    const batches = await Production.find().sort({ createdAt: -1 });
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update progress or status
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isDatabaseConnected()) {
      const batchIndex = mockBatches.findIndex(b => b._id === id);
      if (batchIndex === -1) return res.status(404).json({ error: "Batch not found" });
      
      mockBatches[batchIndex] = { ...mockBatches[batchIndex], ...updates, updatedAt: new Date().toISOString() };
      return res.status(200).json(mockBatches[batchIndex]);
    }

    const batch = await Production.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!batch) return res.status(404).json({ error: "Batch not found" });

    res.status(200).json(batch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Mark batch as completed
const completeBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { 
      status: "completed",
      processStatus: "completed", 
      progress: 100, 
      completedAt: new Date(),
      endTime: new Date().toISOString(),
      level: 6
    };

    if (!isDatabaseConnected()) {
      const batchIndex = mockBatches.findIndex(b => b._id === id);
      if (batchIndex === -1) return res.status(404).json({ error: "Batch not found" });
      
      mockBatches[batchIndex] = { ...mockBatches[batchIndex], ...updates, updatedAt: new Date().toISOString() };
      return res.status(200).json(mockBatches[batchIndex]);
    }
    
    const batch = await Production.findByIdAndUpdate(id, updates, { new: true });

    if (!batch) return res.status(404).json({ error: "Batch not found" });

    res.status(200).json(batch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Delete a batch
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const batchIndex = mockBatches.findIndex(b => b._id === id);
      if (batchIndex === -1) return res.status(404).json({ error: "Batch not found" });
      
      mockBatches.splice(batchIndex, 1);
      return res.status(200).json({ message: "Batch deleted successfully" });
    }
    
    const batch = await Production.findByIdAndDelete(id);

    if (!batch) return res.status(404).json({ error: "Batch not found" });

    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBatch,
  getBatches,
  updateBatch,
  completeBatch,
  deleteBatch,
};
