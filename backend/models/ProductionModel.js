const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema(
  {
    batchName: { type: String, required: true }, // Maps to batchNumber in frontend
    product: { type: String, required: true }, // Maps to productName in frontend
    quantity: { type: Number, required: true }, // Maps to targetYield in frontend
    status: {
      type: String,
      enum: ["idle", "running", "paused", "completed", "failed"],
      default: "idle",
    },
    processStatus: {
      type: String,
      enum: [
        "getting-raw-materials",
        "washing-materials",
        "preparing-materials",
        "machine-1",
        "machine-2",
        "machine-3",
        "completed",
        "failed",
      ],
      default: "getting-raw-materials",
    },
    progress: { type: Number, default: 0 }, // % complete
    estimatedTime: { type: String, default: "1 hour" },
    actualTime: { type: String },
    operator: { type: String, required: true },
    startTime: { type: String },
    endTime: { type: String },
    yield: { type: Number, default: 0 }, // Current yield
    targetYield: { type: Number, required: true }, // Target yield (same as quantity)
    quality: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: "good",
    },
    level: { type: Number, default: 0, min: 0, max: 6 }, // Production level (0-6)
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Production", productionSchema);
