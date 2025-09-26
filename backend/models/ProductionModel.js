const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema(
  {
    batchName: { type: String, required: true },
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
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
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Production", productionSchema);
