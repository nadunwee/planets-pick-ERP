const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");
const {
  submitProcurementChangeRequest,
  getProcurementChangeRequests,
  approveProcurementChangeRequest,
  rejectProcurementChangeRequest,
} = require("../controllers/procurementApprovalController");

router.use(requireAuth);

router.post("/", allowLevels("L1", "L2", "L4", "L5"), submitProcurementChangeRequest);

router.get("/", allowLevels("L1", "L2", "L4", "L5"), getProcurementChangeRequests);

router.post(
  "/:id/approve",
  allowLevels("L2", "L4", "L5"),
  approveProcurementChangeRequest
);

router.post(
  "/:id/reject",
  allowLevels("L2", "L4", "L5"),
  rejectProcurementChangeRequest
);

module.exports = router;
