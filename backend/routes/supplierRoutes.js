const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const { body, param } = require("express-validator");
const requireAuth = require("../middleware/requireAuth");
const { allowLevels } = require("../middleware/accessControl");

// Validation rules
const createValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("code").notEmpty().withMessage("Code is required"),
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("onTimeDeliveryRate").optional().isFloat({ min: 0, max: 100 }),
  body("qualityScore").optional().isFloat({ min: 0, max: 100 }),
  body("responsivenessScore").optional().isFloat({ min: 0, max: 100 }),
  body("totalSpend").optional().isFloat({ min: 0 }),
  body("ordersCount").optional().isInt({ min: 0 }),
];

const updateValidation = [
  param("id").isMongoId().withMessage("Invalid supplier id"),
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("onTimeDeliveryRate").optional().isFloat({ min: 0, max: 100 }),
  body("qualityScore").optional().isFloat({ min: 0, max: 100 }),
  body("responsivenessScore").optional().isFloat({ min: 0, max: 100 }),
  body("totalSpend").optional().isFloat({ min: 0 }),
  body("ordersCount").optional().isInt({ min: 0 }),
];

router.use(requireAuth);

router.post(
  "/",
  allowLevels("L1", "L2", "L3", "L4"),
  createValidation,
  supplierController.createSupplier
);
router.get(
  "/",
  allowLevels("L1", "L2", "L3", "L4"),
  supplierController.getSuppliers
);
router.get(
  "/rankings",
  allowLevels("L1", "L2", "L3", "L4"),
  supplierController.getSupplierRankings
);
router.get(
  "/:id",
  allowLevels("L1", "L2", "L3", "L4"),
  supplierController.getSupplierById
);
router.put(
  "/:id",
  allowLevels("L1", "L2", "L3", "L4"),
  updateValidation,
  supplierController.updateSupplier
);
router.delete(
  "/:id",
  allowLevels("L2", "L3", "L4"),
  supplierController.deleteSupplier
);

module.exports = router;
