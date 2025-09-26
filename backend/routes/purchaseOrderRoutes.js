const express = require("express");
const router = express.Router();
const { listPOs, getPO, createPO, updatePO, deletePO } = require("../controllers/purchaseOrderController");

// List all
router.get("/", listPOs);

// Get one
router.get("/:id", getPO);

// Create
router.post("/", createPO);

// Update
router.put("/:id", updatePO);

// Delete
router.delete("/:id", deletePO);

module.exports = router;
