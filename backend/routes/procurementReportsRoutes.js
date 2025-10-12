const express = require('express');
const router = express.Router();
const procurementReportsController = require('../controllers/procurementReportsController');
const { body, param, query } = require('express-validator');
const requireAuth = require('../middleware/requireAuth');
const { allowLevels } = require('../middleware/accessControl');

router.use(requireAuth);

// Validation middleware
const validateDateRange = [
  body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
  body('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
  body('startDate').custom((value, { req }) => {
    if (new Date(value) >= new Date(req.body.endDate)) {
      throw new Error('Start date must be before end date');
    }
    return true;
  })
];

const validateSupplierRanking = [
  ...validateDateRange,
  body('weights.wOnTime').optional().isFloat({ min: 0, max: 1 }).withMessage('On-time weight must be between 0 and 1'),
  body('weights.wQuality').optional().isFloat({ min: 0, max: 1 }).withMessage('Quality weight must be between 0 and 1'),
  body('weights.wResponse').optional().isFloat({ min: 0, max: 1 }).withMessage('Response weight must be between 0 and 1')
];

const validateSpendingAnalytics = [
  ...validateDateRange,
  body('groupBy').optional().isIn(['month', 'year']).withMessage('Group by must be either month or year')
];

// Report generation routes - L2, L3, L4 can generate procurement reports
router.post('/supplier-ranking', allowLevels("L2", "L3", "L4"), validateSupplierRanking, procurementReportsController.generateSupplierRanking);
router.post('/spending-analytics', allowLevels("L2", "L3", "L4"), validateSpendingAnalytics, procurementReportsController.generateSpendingAnalytics);
router.post('/orders-by-supplier', allowLevels("L2", "L3", "L4"), validateDateRange, procurementReportsController.generateOrdersBySupplier);
router.post('/procurement-cycle', allowLevels("L2", "L3", "L4"), validateDateRange, procurementReportsController.generateProcurementCycle);

// Report management routes - L2, L3, L4 can view reports
router.get('/', allowLevels("L2", "L3", "L4"), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('reportType').optional().isIn([
    'supplier_ranking',
    'spending_analytics', 
    'orders_by_supplier',
    'procurement_cycle',
    'supplier_performance',
    'monthly_procurement_summary',
    'invoice_matching_report'
  ]).withMessage('Invalid report type'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
], procurementReportsController.getReports);

router.get('/:id', allowLevels("L2", "L3", "L4"), [
  param('id').isMongoId().withMessage('Invalid report ID')
], procurementReportsController.getReport);

router.delete('/:id', allowLevels("L3", "L4"), [
  param('id').isMongoId().withMessage('Invalid report ID')
], procurementReportsController.deleteReport);

module.exports = router;
