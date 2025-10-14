const express = require("express");
const router = express.Router();
const {
  createBatch,
  getBatches,
  updateBatch,
  completeBatch,
  deleteBatch,
  downloadProductionReport,
} = require("../controllers/productionController");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

router.use(requireAuth);

// Routes
router.post("/", allowLevels("L1", "L2", "L3", "L4", "L5"), createBatch); // start a new batch - All levels can create
router.get("/", allowLevels("L1", "L2", "L3", "L4", "L5"), getBatches); // get all batches - All levels can view
router.get(
  "/report/pdf",
  allowLevels("L1", "L2", "L3", "L4", "L5"),
  downloadProductionReport
);
router.patch("/:id", allowLevels("L1", "L2", "L3", "L4", "L5"), updateBatch); // update progress/status - All levels can update
router.patch(
  "/:id/complete",
  allowLevels("L1", "L2", "L3", "L4", "L5"),
  completeBatch
); // mark completed - All levels can complete
router.delete("/:id", allowLevels("L2", "L4", "L5"), deleteBatch); // delete batch - L2, L4, and L5 can delete (not L3)

module.exports = router;
