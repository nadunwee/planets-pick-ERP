const express = require("express");
const router = express.Router();
const {
  createBatch,
  getBatches,
  updateBatch,
  completeBatch,
  deleteBatch,
} = require("../controllers/productionController");

// Routes
router.post("/", createBatch); // start a new batch
router.get("/", getBatches); // get all batches
router.patch("/:id", updateBatch); // update progress/status
router.patch("/:id/complete", completeBatch); // mark completed
router.delete("/:id", deleteBatch); // delete batch

module.exports = router;
