const mongoose = require('mongoose');

const ProcurementReportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    required: true,
    enum: [
      'supplier_ranking',
      'spending_analytics', 
      'orders_by_supplier',
      'procurement_cycle',
      'supplier_performance',
      'monthly_procurement_summary',
      'invoice_matching_report'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateRange: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  filters: {
    suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }],
    categories: [String],
    status: [String]
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  filePath: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  metadata: {
    totalRecords: { type: Number, default: 0 },
    generationTime: { type: Number, default: 0 }, // in milliseconds
    fileSize: { type: Number, default: 0 } // in bytes
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProcurementReportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProcurementReport', ProcurementReportSchema);
