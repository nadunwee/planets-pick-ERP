const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { body, param } = require('express-validator');

// Validation rules
const createValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('code').notEmpty().withMessage('Code is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('onTimeDeliveryRate').optional().isFloat({ min: 0, max: 100 }),
  body('qualityScore').optional().isFloat({ min: 0, max: 100 }),
  body('responsivenessScore').optional().isFloat({ min: 0, max: 100 }),
  body('totalSpend').optional().isFloat({ min: 0 }),
  body('ordersCount').optional().isInt({ min: 0 }),
];

const updateValidation = [
  param('id').isMongoId().withMessage('Invalid supplier id'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('onTimeDeliveryRate').optional().isFloat({ min: 0, max: 100 }),
  body('qualityScore').optional().isFloat({ min: 0, max: 100 }),
  body('responsivenessScore').optional().isFloat({ min: 0, max: 100 }),
  body('totalSpend').optional().isFloat({ min: 0 }),
  body('ordersCount').optional().isInt({ min: 0 }),
];

router.post('/', createValidation, supplierController.createSupplier);
router.get('/', supplierController.getSuppliers);
router.get('/rankings', supplierController.getSupplierRankings);
router.get('/:id', supplierController.getSupplierById);
router.put('/:id', updateValidation, supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
