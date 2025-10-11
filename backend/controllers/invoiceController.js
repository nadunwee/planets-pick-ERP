const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");
const pdfService = require("../services/pdfService");
const { hasLevelAtLeast } = require("../middleware/accessControl");

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
      .populate({
        path: "purchaseOrder",
        select: "poNumber status createdBy",
        populate: { path: "createdBy", select: "name email" },
      })
      .populate("supplier", "name code");

    let result = invoices;

    if (req.user.level === "L1") {
      const userId = req.user._id.toString();
      result = invoices.filter((inv) => {
        const poCreator = inv.purchaseOrder?.createdBy;
        if (!poCreator) return false;
        if (typeof poCreator === "string") {
          return poCreator === userId;
        }
        return poCreator._id?.toString() === userId;
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single invoice
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: "purchaseOrder",
        select: "poNumber status createdBy",
        populate: { path: "createdBy", select: "name email" },
      })
      .populate("supplier", "name code");

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (req.user.level === "L1") {
      const createdBy = invoice.purchaseOrder?.createdBy;
      const userId = req.user._id.toString();
      const allowed =
        createdBy &&
        (typeof createdBy === "string"
          ? createdBy === userId
          : createdBy._id?.toString() === userId);
      if (!allowed) {
        return res
          .status(403)
          .json({ error: "Access denied for this invoice" });
      }
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

    if (!hasLevelAtLeast(req.user, "L3")) {
      return res.status(403).json({
        error: "Only finance managers or directors can generate invoices",
      });
    }

    const purchaseOrder = await PurchaseOrder.findById(poId).populate(
      "supplier",
      "name"
    );

    if (!purchaseOrder) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    if (purchaseOrder.status !== "Approved") {
      return res.status(400).json({
        error:
          "Purchase order must be approved before an invoice can be generated",
      });
    }

    const existingInvoice = await Invoice.findOne({
      purchaseOrder: purchaseOrder._id,
    })
      .populate({
        path: "purchaseOrder",
        select: "poNumber status createdBy",
      })
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
    purchaseOrder.status = "Approved";
    await purchaseOrder.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate({
        path: "purchaseOrder",
        select: "poNumber status createdBy",
        populate: { path: "createdBy", select: "name email" },
      })
      .populate("supplier", "name code");

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const streamInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate({
        path: "purchaseOrder",
        select: "poNumber status createdBy",
        populate: [
          { path: "supplier", select: "name code" },
          { path: "createdBy", select: "name email" },
        ],
      })
      .populate("supplier", "name code");

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (req.user.level === "L1") {
      const poCreator = invoice.purchaseOrder?.createdBy;
      const userId = req.user._id.toString();
      const allowed =
        poCreator &&
        (typeof poCreator === "string"
          ? poCreator === userId
          : poCreator._id?.toString() === userId);
      if (!allowed) {
        return res
          .status(403)
          .json({ error: "Access denied for this invoice" });
      }
    }

    const pdfBuffer = await pdfService.generateInvoicePDF(invoice);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${invoice.invoiceNumber || "invoice"}.pdf`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Invoice PDF generation failed", error);
    res.status(500).json({ error: "Failed to generate invoice PDF" });
  }
};

module.exports = {
  listInvoices,
  getInvoice,
  generateInvoiceFromPO,
  streamInvoicePdf,
};
