const Supplier = require('../models/Supplier');
const { validationResult } = require('express-validator');

// Create supplier
exports.createSupplier = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { code } = req.body;
    const exists = await Supplier.findOne({ code });
    if (exists) return res.status(409).json({ message: 'Supplier code already exists' });

    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
};

// Get all suppliers (with search & pagination)
exports.getSuppliers = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, q, sort } = req.query;
    const skip = (page - 1) * limit;

    const filter = { deleted: false };
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { code: new RegExp(q, 'i') },
        { contactPerson: new RegExp(q, 'i') },
      ];
    }

    const sortOption = {};
    if (sort === 'spend') sortOption.totalSpend = -1;
    else if (sort === 'name') sortOption.name = 1;
    else sortOption.updatedAt = -1;

    const [items, total] = await Promise.all([
      Supplier.find(filter).sort(sortOption).skip(Number(skip)).limit(Number(limit)),
      Supplier.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Get supplier by id
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier || supplier.deleted) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

// Update supplier
exports.updateSupplier = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier || supplier.deleted) return res.status(404).json({ message: 'Supplier not found' });

    Object.assign(supplier, req.body, { updatedAt: Date.now() });
    await supplier.save();
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

// Soft-delete supplier
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier || supplier.deleted) return res.status(404).json({ message: 'Supplier not found' });

    supplier.deleted = true;
    supplier.updatedAt = Date.now();
    await supplier.save();
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    next(err);
  }
};

// Supplier rankings
exports.getSupplierRankings = async (req, res, next) => {
  try {
    const { wOnTime = 0.4, wQuality = 0.4, wResponse = 0.2 } = req.query;

    const w1 = Number(wOnTime);
    const w2 = Number(wQuality);
    const w3 = Number(wResponse);

    const suppliers = await Supplier.find({ deleted: false });

    const ranked = suppliers.map(s => {
      const onTime = Math.max(0, Math.min(100, s.onTimeDeliveryRate || 0));
      const quality = Math.max(0, Math.min(100, s.qualityScore || 0));
      const response = Math.max(0, Math.min(100, s.responsivenessScore || 0));

      const score = (onTime * w1) + (quality * w2) + (response * w3);

      return { supplier: s, score: Number(score.toFixed(2)) };
    });

    ranked.sort((a, b) => b.score - a.score);

    res.json(ranked);
  } catch (err) {
    next(err);
  }
};
