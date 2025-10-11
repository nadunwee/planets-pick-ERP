const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");

const generateInvoiceNumber = (poNumber) => `INV-${poNumber}`;

const normalizePOItems = (items) =>
  items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;

    return {
      product: item.materialName,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
    };
  });

// List all invoices
const listInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .populate("purchaseOrder", "poNumber status")
      .populate("supplier", "name code");
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single invoice
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("purchaseOrder", "poNumber status")
      .populate("supplier", "name code");

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate invoice from purchase order
const generateInvoiceFromPO = async (req, res) => {
  try {
    const { poId } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(poId).populate(
      "supplier",
      "name"
    );

    if (!purchaseOrder) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    const existingInvoice = await Invoice.findOne({
      purchaseOrder: purchaseOrder._id,
    })
      .populate("purchaseOrder", "poNumber status")
      .populate("supplier", "name code");

    if (existingInvoice) {
      return res.status(200).json(existingInvoice);
    }

    const supplierDetails = purchaseOrder.supplier;
    const supplierId =
      (supplierDetails && supplierDetails._id) || supplierDetails || null;
    const supplierName =
      (supplierDetails && supplierDetails.name) || "Unknown Supplier";

    if (!supplierId) {
      return res
        .status(400)
        .json({ error: "Supplier information is missing on this PO" });
    }

    const items = normalizePOItems(purchaseOrder.items);
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const invoiceNumber = generateInvoiceNumber(purchaseOrder.poNumber);

    const invoice = new Invoice({
      invoiceNumber,
      purchaseOrder: purchaseOrder._id,
      supplier: supplierId,
      supplierName,
      items,
      totalAmount,
      status: "Draft",
    });

    await invoice.save();

    purchaseOrder.invoice = invoice._id;
    await purchaseOrder.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("purchaseOrder", "poNumber status")
      .populate("supplier", "name code");

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listInvoices,
  getInvoice,
  generateInvoiceFromPO,
};
