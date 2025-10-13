const fs = require("fs");
const path = require("path");
const ProcurementReport = require("../models/ProcurementReport");
const Supplier = require("../models/Supplier");
const PurchaseOrder = require("../models/PurchaseOrder");
const pdfService = require("../services/pdfService");

const ensureNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (value) =>
  ensureNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatScore = (value) =>
  ensureNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatPercent = (value) =>
  `${ensureNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

const procurementReportDir = path.join(
  __dirname,
  "..",
  "reports",
  "procurement"
);

const ensureReportDirectory = () => {
  if (!fs.existsSync(procurementReportDir)) {
    fs.mkdirSync(procurementReportDir, { recursive: true });
  }
};

const buildReportFilePath = (reportId) =>
  path.join(procurementReportDir, `${reportId}.pdf`);

const computeOrderTotal = (order) => {
  if (!order) return 0;
  if (typeof order.totalAmount === "number") {
    return ensureNumber(order.totalAmount);
  }
  const items = Array.isArray(order.items) ? order.items : [];
  return items.reduce((sum, item) => {
    const quantity = ensureNumber(item.quantity);
    const unitPrice = ensureNumber(
      item.unitPrice ?? item.price ?? item.cost ?? 0
    );
    return sum + quantity * unitPrice;
  }, 0);
};

const buildSummaryCards = (items) =>
  `<div class="grid">${items
    .map(
      (item) => `
        <div class="card">
          <span class="label">${item.label}</span>
          <span class="value">${item.value}</span>
        </div>
      `
    )
    .join("")}</div>`;

const renderTable = (headers, rows, emptyMessage = "No data available") => `
  <table class="table">
    <thead>
      <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${
        rows.length
          ? rows.join("")
          : `<tr><td colspan="${headers.length}">${emptyMessage}</td></tr>`
      }
    </tbody>
  </table>
`;

const wrapHtmlDocument = (title, periodLabel, sections) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #2c3e50; }
    .header { border-bottom: 2px solid #34495e; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 26px; }
    .meta { margin-top: 8px; color: #7f8c8d; font-size: 14px; }
    .section { margin-bottom: 32px; }
    .section h2 { margin: 0 0 12px 0; font-size: 18px; color: #2c3e50; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .card .label { display: block; font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; }
    .card .value { font-size: 20px; font-weight: 600; color: #2d3748; margin-top: 4px; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
    .table th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.04em; font-size: 12px; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">
      <div>Generated on: ${formatDateTime(Date.now())}</div>
      ${periodLabel ? `<div>${periodLabel}</div>` : ""}
    </div>
  </div>
  ${sections.join("\n")}
</body>
</html>
`;

const persistReportPdf = async (report, html, generationStart) => {
  ensureReportDirectory();
  const outputPath = buildReportFilePath(report._id);
  const pdfBuffer = await pdfService.generatePDF(html, {
    printBackground: true,
  });
  fs.writeFileSync(outputPath, pdfBuffer);
  report.status = "completed";
  report.filePath = outputPath;
  report.metadata = {
    ...(report.metadata || {}),
    fileSize: pdfBuffer.length,
    generationTime: Date.now() - generationStart,
  };
  await report.save();
  return outputPath;
};

const markReportFailed = async (report, generationStart) => {
  if (!report) {
    return;
  }
  report.status = "failed";
  report.metadata = {
    ...(report.metadata || {}),
    generationTime: Date.now() - generationStart,
  };
  await report.save();
};

exports.generateSupplierRanking = async (req, res) => {
  const generationStart = Date.now();
  let report;
  try {
    const { startDate, endDate, weights = {} } = req.body;
    const { wOnTime = 0.4, wQuality = 0.4, wResponse = 0.2 } = weights;

    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    const suppliers = await Supplier.find({ deleted: false }).sort({ name: 1 });
    const orders = await PurchaseOrder.find({
      createdAt: { $gte: rangeStart, $lte: rangeEnd },
      status: { $in: ["Approved", "Delivered"] },
    })
      .populate("supplier", "name code category status")
      .lean();

    const rankings = suppliers.map((supplier) => {
      const supplierOrders = orders.filter(
        (order) =>
          order.supplier &&
          order.supplier._id.toString() === supplier._id.toString()
      );

      const onTimeRate = ensureNumber(supplier.onTimeDeliveryRate);
      const qualityScore = ensureNumber(supplier.qualityScore);
      const responseScore = ensureNumber(supplier.responsivenessScore);
      const weightedScore =
        onTimeRate * wOnTime +
        qualityScore * wQuality +
        responseScore * wResponse;

      const totalSpend = supplierOrders.reduce(
        (sum, order) => sum + computeOrderTotal(order),
        0
      );

      const orderCount = supplierOrders.length;
      const avgOrderValue = orderCount > 0 ? totalSpend / orderCount : 0;

      return {
        supplier: {
          _id: supplier._id,
          name: supplier.name,
          code: supplier.code,
          category: supplier.category,
          status: supplier.status,
        },
        metrics: {
          onTimeRate,
          qualityScore,
          responseScore,
          weightedScore: Number(weightedScore.toFixed(2)),
          totalSpend: Number(totalSpend.toFixed(2)),
          orderCount,
          avgOrderValue: Number(avgOrderValue.toFixed(2)),
        },
      };
    });

    rankings.sort((a, b) => b.metrics.weightedScore - a.metrics.weightedScore);

    report = new ProcurementReport({
      reportType: "supplier_ranking",
      title: "Supplier Performance Ranking",
      description: `Supplier ranking based on performance metrics from ${formatDate(
        rangeStart
      )} to ${formatDate(rangeEnd)}`,
      generatedBy: req.user.id,
      dateRange: { startDate: rangeStart, endDate: rangeEnd },
      data: {
        rankings,
        weights: { wOnTime, wQuality, wResponse },
        totalSuppliers: suppliers.length,
        dateRange: { startDate, endDate },
      },
      status: "generating",
      metadata: {
        totalRecords: rankings.length,
      },
    });

    await report.save();

    const rankingRows = rankings.map(
      (entry, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${entry.supplier.name}</td>
        <td>${entry.supplier.code || "—"}</td>
        <td>${entry.supplier.category || "—"}</td>
        <td>${entry.supplier.status || "—"}</td>
        <td>${formatPercent(entry.metrics.onTimeRate)}</td>
        <td>${formatScore(entry.metrics.qualityScore)}</td>
        <td>${formatScore(entry.metrics.responseScore)}</td>
        <td>${formatScore(entry.metrics.weightedScore)}</td>
        <td>LKR ${formatCurrency(entry.metrics.totalSpend)}</td>
        <td>${entry.metrics.orderCount}</td>
        <td>LKR ${formatCurrency(entry.metrics.avgOrderValue)}</td>
      </tr>
    `
    );

    const sections = [
      `<div class="section">
        <h2>Weighting Overview</h2>
        ${buildSummaryCards([
          {
            label: "On-Time Delivery Weight",
            value: formatPercent(wOnTime * 100),
          },
          { label: "Quality Weight", value: formatPercent(wQuality * 100) },
          {
            label: "Responsiveness Weight",
            value: formatPercent(wResponse * 100),
          },
          { label: "Suppliers Evaluated", value: suppliers.length },
        ])}
      </div>`,
      `<div class="section">
        <h2>Supplier Rankings</h2>
        ${renderTable(
          [
            "Rank",
            "Supplier",
            "Code",
            "Category",
            "Status",
            "On-Time",
            "Quality",
            "Responsiveness",
            "Weighted Score",
            "Total Spend",
            "Orders",
            "Avg Order Value",
          ],
          rankingRows
        )}
      </div>`,
    ];

    const html = wrapHtmlDocument(
      report.title,
      `Period: ${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`,
      sections
    );

    await persistReportPdf(report, html, generationStart);

    res.json({
      success: true,
      report: {
        id: report._id,
        title: report.title,
        data: report.data,
        generatedAt: report.createdAt,
        downloadUrl: `/api/procurement-reports/${report._id}/download`,
      },
    });
  } catch (error) {
    console.error("Error generating supplier ranking:", error);
    await markReportFailed(report, generationStart);
    res.status(500).json({
      success: false,
      message: "Failed to generate supplier ranking report",
      error: error.message,
    });
  }
};

exports.generateSpendingAnalytics = async (req, res) => {
  const generationStart = Date.now();
  let report;
  try {
    const { startDate, endDate, groupBy = "month" } = req.body;
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    const orders = await PurchaseOrder.find({
      createdAt: { $gte: rangeStart, $lte: rangeEnd },
      status: { $in: ["Approved", "Delivered"] },
    })
      .populate("supplier", "name code category")
      .lean();

    const spendingByPeriod = {};
    const spendingBySupplier = {};
    const spendingByCategory = {};

    orders.forEach((order) => {
      const orderTotal = computeOrderTotal(order);
      const createdAt = order.createdAt
        ? new Date(order.createdAt)
        : new Date();
      const periodKey =
        groupBy === "year"
          ? createdAt.toISOString().substring(0, 4)
          : createdAt.toISOString().substring(0, 7);

      spendingByPeriod[periodKey] =
        (spendingByPeriod[periodKey] || 0) + orderTotal;

      if (order.supplier) {
        const supplierId = order.supplier._id.toString();
        if (!spendingBySupplier[supplierId]) {
          spendingBySupplier[supplierId] = {
            supplier: order.supplier,
            totalSpend: 0,
            orderCount: 0,
          };
        }
        spendingBySupplier[supplierId].totalSpend += orderTotal;
        spendingBySupplier[supplierId].orderCount += 1;

        const category = order.supplier.category || "Uncategorised";
        spendingByCategory[category] =
          (spendingByCategory[category] || 0) + orderTotal;
      }
    });

    const spendingTrends = Object.entries(spendingByPeriod)
      .map(([period, amount]) => ({
        period,
        amount: Number(amount.toFixed(2)),
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const topSuppliers = Object.values(spendingBySupplier)
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    const categoryBreakdown = Object.entries(spendingByCategory)
      .map(([category, amount]) => ({
        category,
        amount: Number(amount.toFixed(2)),
      }))
      .sort((a, b) => b.amount - a.amount);

    const totalSpend = orders.reduce(
      (sum, order) => sum + computeOrderTotal(order),
      0
    );
    const avgOrderValue = orders.length > 0 ? totalSpend / orders.length : 0;

    report = new ProcurementReport({
      reportType: "spending_analytics",
      title: "Procurement Spending Analytics",
      description: `Spending analysis from ${formatDate(
        rangeStart
      )} to ${formatDate(rangeEnd)}`,
      generatedBy: req.user.id,
      dateRange: { startDate: rangeStart, endDate: rangeEnd },
      data: {
        summary: {
          totalSpend: Number(totalSpend.toFixed(2)),
          totalOrders: orders.length,
          avgOrderValue: Number(avgOrderValue.toFixed(2)),
          dateRange: { startDate, endDate },
        },
        spendingTrends,
        topSuppliers,
        categoryBreakdown,
      },
      status: "generating",
      metadata: {
        totalRecords: orders.length,
      },
    });

    await report.save();

    const summaryCards = buildSummaryCards([
      { label: "Total Spend", value: `LKR ${formatCurrency(totalSpend)}` },
      { label: "Total Orders", value: orders.length },
      {
        label: "Average Order Value",
        value: `LKR ${formatCurrency(avgOrderValue)}`,
      },
      {
        label: "Reporting Period",
        value: `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`,
      },
    ]);

    const trendRows = spendingTrends.map(
      (trend) => `
        <tr>
          <td>${trend.period}</td>
          <td>LKR ${formatCurrency(trend.amount)}</td>
        </tr>
      `
    );

    const supplierRows = topSuppliers.map((entry) => {
      const percentage = totalSpend
        ? formatPercent((entry.totalSpend / totalSpend) * 100)
        : "0%";
      return `
        <tr>
          <td>${entry.supplier.name}</td>
          <td>${entry.supplier.code || "—"}</td>
          <td>${entry.orderCount}</td>
          <td>LKR ${formatCurrency(entry.totalSpend)}</td>
          <td>${percentage}</td>
        </tr>
      `;
    });

    const categoryRows = categoryBreakdown.map(
      (row) => `
        <tr>
          <td>${row.category}</td>
          <td>LKR ${formatCurrency(row.amount)}</td>
        </tr>
      `
    );

    const sections = [
      `<div class="section">
        <h2>Summary</h2>
        ${summaryCards}
      </div>`,
      `<div class="section">
        <h2>Spending Trends (${groupBy === "year" ? "Yearly" : "Monthly"})</h2>
        ${renderTable(["Period", "Spend"], trendRows)}
      </div>`,
      `<div class="section">
        <h2>Top Suppliers</h2>
        ${renderTable(
          ["Supplier", "Code", "Orders", "Total Spend", "% of Spend"],
          supplierRows
        )}
      </div>`,
      `<div class="section">
        <h2>Category Breakdown</h2>
        ${renderTable(["Category", "Spend"], categoryRows)}
      </div>`,
    ];

    const html = wrapHtmlDocument(
      report.title,
      `Period: ${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`,
      sections
    );

    await persistReportPdf(report, html, generationStart);

    res.json({
      success: true,
      report: {
        id: report._id,
        title: report.title,
        data: report.data,
        generatedAt: report.createdAt,
        downloadUrl: `/api/procurement-reports/${report._id}/download`,
      },
    });
  } catch (error) {
    console.error("Error generating spending analytics:", error);
    await markReportFailed(report, generationStart);
    res.status(500).json({
      success: false,
      message: "Failed to generate spending analytics report",
      error: error.message,
    });
  }
};

exports.generateOrdersBySupplier = async (req, res) => {
  const generationStart = Date.now();
  let report;
  try {
    const { startDate, endDate } = req.body;
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    const suppliers = await Supplier.find({ deleted: false }).sort({ name: 1 });

    const ordersBySupplier = [];

    for (const supplier of suppliers) {
      const orders = await PurchaseOrder.find({
        supplier: supplier._id,
        createdAt: { $gte: rangeStart, $lte: rangeEnd },
      }).lean();

      const totalValue = orders.reduce(
        (sum, order) => sum + computeOrderTotal(order),
        0
      );

      const statusBreakdown = orders.reduce((acc, order) => {
        const status = order.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      ordersBySupplier.push({
        supplier: {
          _id: supplier._id,
          name: supplier.name,
          code: supplier.code,
          category: supplier.category,
        },
        metrics: {
          totalOrders: orders.length,
          totalValue: Number(totalValue.toFixed(2)),
          avgOrderValue:
            orders.length > 0
              ? Number((totalValue / orders.length).toFixed(2))
              : 0,
          statusBreakdown,
        },
      });
    }

    ordersBySupplier.sort(
      (a, b) => b.metrics.totalValue - a.metrics.totalValue
    );

    report = new ProcurementReport({
      reportType: "orders_by_supplier",
      title: "Orders by Supplier Analysis",
      description: `Order analysis by supplier from ${formatDate(
        rangeStart
      )} to ${formatDate(rangeEnd)}`,
      generatedBy: req.user.id,
      dateRange: { startDate: rangeStart, endDate: rangeEnd },
      data: {
        ordersBySupplier,
        summary: {
          totalSuppliers: suppliers.length,
          dateRange: { startDate, endDate },
        },
      },
      status: "generating",
      metadata: {
        totalRecords: suppliers.length,
      },
    });

    await report.save();

    const supplierRows = ordersBySupplier.map((entry) => {
      const breakdownText = Object.entries(entry.metrics.statusBreakdown)
        .map(([status, count]) => `${status}: ${count}`)
        .join(" | ");
      return `
        <tr>
          <td>${entry.supplier.name}</td>
          <td>${entry.supplier.code}</td>
          <td>${entry.supplier.category || "—"}</td>
          <td>${entry.metrics.totalOrders}</td>
          <td>LKR ${formatCurrency(entry.metrics.totalValue)}</td>
          <td>LKR ${formatCurrency(entry.metrics.avgOrderValue)}</td>
          <td>${breakdownText || "—"}</td>
        </tr>
      `;
    });

    const sections = [
      `<div class="section">
        <h2>Summary</h2>
        ${buildSummaryCards([
          { label: "Suppliers Analysed", value: suppliers.length },
          {
            label: "Reporting Period",
            value: `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`,
          },
        ])}
      </div>`,
      `<div class="section">
        <h2>Orders by Supplier</h2>
        ${renderTable(
          [
            "Supplier",
            "Code",
            "Category",
            "Orders",
            "Total Value",
            "Average Order",
            "Status Breakdown",
          ],
          supplierRows
        )}
      </div>`,
    ];

    const html = wrapHtmlDocument(
      report.title,
      `Period: ${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`,
      sections
    );

    await persistReportPdf(report, html, generationStart);

    res.json({
      success: true,
      report: {
        id: report._id,
        title: report.title,
        data: report.data,
        generatedAt: report.createdAt,
        downloadUrl: `/api/procurement-reports/${report._id}/download`,
      },
    });
  } catch (error) {
    console.error("Error generating orders by supplier report:", error);
    await markReportFailed(report, generationStart);
    res.status(500).json({
      success: false,
      message: "Failed to generate orders by supplier report",
      error: error.message,
    });
  }
};

exports.generateProcurementCycle = async (req, res) => {
  const generationStart = Date.now();
  let report;
  try {
    const { startDate, endDate } = req.body;
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    const orders = await PurchaseOrder.find({
      createdAt: { $gte: rangeStart, $lte: rangeEnd },
    })
      .populate("supplier", "name code")
      .lean();

    const cycleData = orders.map((order) => {
      const created = order.createdAt ? new Date(order.createdAt) : new Date();
      const updated = order.updatedAt ? new Date(order.updatedAt) : created;
      const cycleTime = Math.max(
        0,
        Math.ceil(
          (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        )
      );

      return {
        orderId: order._id,
        poNumber: order.poNumber,
        supplier: order.supplier,
        status: order.status,
        cycleTime,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    const cycleTimes = cycleData.map((item) => item.cycleTime);
    const avgCycleTime =
      cycleTimes.length > 0
        ? cycleTimes.reduce((sum, value) => sum + value, 0) / cycleTimes.length
        : 0;
    const minCycleTime = cycleTimes.length > 0 ? Math.min(...cycleTimes) : 0;
    const maxCycleTime = cycleTimes.length > 0 ? Math.max(...cycleTimes) : 0;

    const statusSummary = cycleData.reduce((acc, item) => {
      const status = item.status || "Unknown";
      if (!acc[status]) {
        acc[status] = { count: 0, totalCycleTime: 0 };
      }
      acc[status].count += 1;
      acc[status].totalCycleTime += item.cycleTime;
      return acc;
    }, {});

    const statusBreakdown = Object.entries(statusSummary).map(
      ([status, data]) => ({
        status,
        count: data.count,
        avgCycleTime:
          data.count > 0
            ? Number((data.totalCycleTime / data.count).toFixed(2))
            : 0,
      })
    );

    report = new ProcurementReport({
      reportType: "procurement_cycle",
      title: "Procurement Cycle Analysis",
      description: `Procurement cycle time analysis from ${formatDate(
        rangeStart
      )} to ${formatDate(rangeEnd)}`,
      generatedBy: req.user.id,
      dateRange: { startDate: rangeStart, endDate: rangeEnd },
      data: {
        cycleData,
        statistics: {
          avgCycleTime: Number(avgCycleTime.toFixed(2)),
          minCycleTime,
          maxCycleTime,
          totalOrders: cycleData.length,
        },
        statusBreakdown,
        dateRange: { startDate, endDate },
      },
      status: "generating",
      metadata: {
        totalRecords: cycleData.length,
      },
    });

    await report.save();

    const summaryCards = buildSummaryCards([
      {
        label: "Average Cycle Time",
        value: `${formatScore(avgCycleTime)} days`,
      },
      { label: "Minimum Cycle Time", value: `${minCycleTime} days` },
      { label: "Maximum Cycle Time", value: `${maxCycleTime} days` },
      { label: "Orders Analysed", value: cycleData.length },
    ]);

    const statusRows = statusBreakdown.map(
      (item) => `
        <tr>
          <td>${item.status}</td>
          <td>${item.count}</td>
          <td>${item.avgCycleTime} days</td>
        </tr>
      `
    );

    const detailRows = cycleData.map(
      (item) => `
        <tr>
          <td>${item.poNumber || item.orderId}</td>
          <td>${item.supplier ? item.supplier.name : "—"}</td>
          <td>${item.status || "Unknown"}</td>
          <td>${item.cycleTime} days</td>
          <td>${formatDate(item.createdAt)}</td>
          <td>${formatDate(item.updatedAt)}</td>
        </tr>
      `
    );

    const sections = [
      `<div class="section">
        <h2>Cycle Time Summary</h2>
        ${summaryCards}
      </div>`,
      `<div class="section">
        <h2>Status Breakdown</h2>
        ${renderTable(["Status", "Orders", "Avg Cycle"], statusRows)}
      </div>`,
      `<div class="section">
        <h2>Order Detail</h2>
        ${renderTable(
          [
            "PO Number",
            "Supplier",
            "Status",
            "Cycle Time",
            "Created",
            "Updated",
          ],
          detailRows
        )}
      </div>`,
    ];

    const html = wrapHtmlDocument(
      report.title,
      `Period: ${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`,
      sections
    );

    await persistReportPdf(report, html, generationStart);

    res.json({
      success: true,
      report: {
        id: report._id,
        title: report.title,
        data: report.data,
        generatedAt: report.createdAt,
        downloadUrl: `/api/procurement-reports/${report._id}/download`,
      },
    });
  } catch (error) {
    console.error("Error generating procurement cycle report:", error);
    await markReportFailed(report, generationStart);
    res.status(500).json({
      success: false,
      message: "Failed to generate procurement cycle report",
      error: error.message,
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, reportType, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (reportType) filter.reportType = reportType;
    if (startDate && endDate) {
      filter["dateRange.startDate"] = { $gte: new Date(startDate) };
      filter["dateRange.endDate"] = { $lte: new Date(endDate) };
    }

    const [reports, total] = await Promise.all([
      ProcurementReport.find(filter)
        .populate("generatedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      ProcurementReport.countDocuments(filter),
    ]);

    const reportsWithDownloads = reports.map((report) => ({
      ...report.toObject(),
      downloadUrl:
        report.status === "completed" && report.filePath
          ? `/api/procurement-reports/${report._id}/download`
          : null,
    }));

    res.json({
      success: true,
      reports: reportsWithDownloads,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ProcurementReport.findById(id).populate(
      "generatedBy",
      "name email"
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      report: {
        ...report.toObject(),
        downloadUrl:
          report.status === "completed" && report.filePath
            ? `/api/procurement-reports/${report._id}/download`
            : null,
      },
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ProcurementReport.findById(id);

    if (!report || report.status !== "completed" || !report.filePath) {
      return res.status(404).json({
        success: false,
        message: "Report PDF not found",
      });
    }

    if (!fs.existsSync(report.filePath)) {
      return res.status(404).json({
        success: false,
        message: "Report PDF is missing from storage",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${path.basename(report.filePath)}`
    );

    fs.createReadStream(report.filePath).pipe(res);
  } catch (error) {
    console.error("Error downloading report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download report",
      error: error.message,
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ProcurementReport.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.filePath && fs.existsSync(report.filePath)) {
      try {
        fs.unlinkSync(report.filePath);
      } catch (error) {
        console.warn("Failed to remove report PDF:", error);
      }
    }

    res.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message,
    });
  }
};
