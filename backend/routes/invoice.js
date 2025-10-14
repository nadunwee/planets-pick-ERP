const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  allowLevels,
  requireLevelAtLeast,
} = require("../middleware/accessControl");
const {
  listInvoices,
  getInvoice,
  generateInvoiceFromPO,
  streamInvoicePdf,
} = require("../controllers/invoiceController");

router.use(requireAuth);

router.get("/", allowLevels("L1", "L2", "L3", "L4", "L5"), listInvoices);
router.get("/:id/pdf", allowLevels("L1", "L2", "L3", "L4", "L5"), streamInvoicePdf);
router.get("/:id", allowLevels("L1", "L2", "L3", "L4", "L5"), getInvoice);
router.post("/from-po/:poId", requireLevelAtLeast("L3"), generateInvoiceFromPO);

module.exports = router;
