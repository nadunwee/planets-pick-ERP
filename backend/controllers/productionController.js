const Production = require("../models/ProductionModel");

// ✅ Create new batch
const createBatch = async (req, res) => {
  try {
    const { batchName, product, quantity } = req.body;

    const batch = new Production({
      batchName,
      product,
      quantity,
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
    const batch = await Production.findByIdAndUpdate(
      id,
      { processStatus: "completed", progress: 100, completedAt: new Date() },
      { new: true }
    );

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
