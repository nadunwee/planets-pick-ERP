const express = require("express");
const router = express.Router();
const {
  listInvoices,
  getInvoice,
  generateInvoiceFromPO,
} = require("../controllers/invoiceController");

router.get("/", listInvoices);
router.get("/:id", getInvoice);
router.post("/from-po/:poId", generateInvoiceFromPO);

module.exports = router;
