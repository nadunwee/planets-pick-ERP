const Production = require("../models/ProductionModel");
const pdfService = require("../services/pdfService");

const QUALITY_SCORE_MAP = {
  excellent: 100,
  good: 80,
  fair: 60,
  poor: 40,
};

const QUALITY_LABELS = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

const capitalize = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const toNumber = (value) => {
  const numeric = Number(value ?? 0);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const toFixedNumber = (value, fractionDigits = 2) => {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Number(numeric.toFixed(fractionDigits));
};

const formatPercent = (value) => `${toFixedNumber(value, 2)}%`;

const parseDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (date) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

const formatDateTime = (value) => {
  const date = parseDate(value);
  if (!date) return "";
  const isoString = date.toISOString();
  const [day, time] = isoString.split("T");
  return `${day} ${time.slice(0, 8)}`;
};

const normalizeBatchForReport = (batch) => {
  const identifier =
    typeof batch._id === "object" && batch._id !== null
      ? batch._id.toString()
      : batch._id || batch.id || batch.batchName;

  return {
    id: identifier,
    batchName: batch.batchName || "Unknown Batch",
    product: batch.product || "Unknown Product",
    status: batch.status || "unknown",
    processStatus: batch.processStatus || "n/a",
    operator: batch.operator || "Unassigned",
    targetYield: toNumber(
      batch.targetYield ?? batch.quantity ?? batch.expectedYield
    ),
    yield: toNumber(batch.yield ?? batch.actualYield),
    progress: toNumber(batch.progress),
    quality: batch.quality || "unknown",
    startTime:
      formatDateTime(batch.startTime || batch.startedAt || batch.createdAt) ||
      "",
    endTime: formatDateTime(batch.endTime || batch.completedAt) || "",
    createdAt: formatDateTime(batch.createdAt) || "",
    updatedAt: formatDateTime(batch.updatedAt) || "",
  };
};

const filterBatchesByRange = (batches, startDate, endDate) => {
  if (!startDate && !endDate) {
    return batches;
  }

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const endOfDay = end
    ? new Date(new Date(end).setHours(23, 59, 59, 999))
    : null;

  return batches.filter((batch) => {
    const batchDate =
      parseDate(batch.createdAt) ||
      parseDate(batch.startTime) ||
      parseDate(batch.startedAt);
    if (!batchDate) {
      return true;
    }
    if (start && batchDate < start) {
      return false;
    }
    if (endOfDay && batchDate > endOfDay) {
      return false;
    }
    return true;
  });
};

const buildPeriodLabel = (batches, startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start || end) {
    const startLabel = start ? formatDate(start) : "Beginning";
    const endLabel = end ? formatDate(end) : "Present";
    return `${startLabel} → ${endLabel}`;
  }

  const timeline = batches
    .map(
      (batch) =>
        parseDate(batch.createdAt) ||
        parseDate(batch.startTime) ||
        parseDate(batch.startedAt)
    )
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (!timeline.length) {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }

  const first = timeline[0];
  const last = timeline[timeline.length - 1];

  const firstLabel = formatDate(first);
  const lastLabel = formatDate(last);

  return firstLabel === lastLabel ? firstLabel : `${firstLabel} → ${lastLabel}`;
};

const buildProductionMetrics = (batches) => {
  const totalBatches = batches.length;

  const totalTargetYield = batches.reduce(
    (sum, batch) => sum + toNumber(batch.targetYield),
    0
  );
  const totalActualYield = batches.reduce(
    (sum, batch) => sum + toNumber(batch.yield),
    0
  );
  const totalProgress = batches.reduce(
    (sum, batch) => sum + toNumber(batch.progress),
    0
  );

  const completedBatches = batches.filter(
    (batch) => batch.status === "completed"
  ).length;
  const activeBatches = batches.filter((batch) =>
    ["running", "paused"].includes(batch.status)
  ).length;
  const failedBatches = batches.filter(
    (batch) => batch.status === "failed"
  ).length;

  const qualityScores = batches
    .map((batch) => QUALITY_SCORE_MAP[batch.quality] ?? null)
    .filter((score) => score !== null);

  const averageQualityScore = qualityScores.length
    ? toFixedNumber(
        qualityScores.reduce((sum, score) => sum + score, 0) /
          qualityScores.length
      )
    : 0;

  const averageEfficiency = totalTargetYield
    ? toFixedNumber((totalActualYield / totalTargetYield) * 100)
    : 0;

  const averageProgress = totalBatches
    ? toFixedNumber(totalProgress / totalBatches)
    : 0;

  const statusMap = batches.reduce((acc, batch) => {
    acc[batch.status] = (acc[batch.status] || 0) + 1;
    return acc;
  }, {});

  const qualityMap = batches.reduce((acc, batch) => {
    acc[batch.quality] = (acc[batch.quality] || 0) + 1;
    return acc;
  }, {});

  const operatorMap = batches.reduce((acc, batch) => {
    const key = batch.operator || "Unassigned";
    if (!acc[key]) {
      acc[key] = {
        batchesCompleted: 0,
        totalQuality: 0,
        totalYield: 0,
        totalTarget: 0,
      };
    }
    const bucket = acc[key];
    bucket.batchesCompleted += 1;
    bucket.totalQuality += QUALITY_SCORE_MAP[batch.quality] ?? 0;
    bucket.totalYield += toNumber(batch.yield);
    bucket.totalTarget += toNumber(batch.targetYield);
    return acc;
  }, {});

  const productMap = batches.reduce((acc, batch) => {
    const key = batch.product || "Unknown Product";
    if (!acc[key]) {
      acc[key] = {
        totalYield: 0,
        totalTarget: 0,
        totalBatches: 0,
      };
    }
    const bucket = acc[key];
    bucket.totalYield += toNumber(batch.yield);
    bucket.totalTarget += toNumber(batch.targetYield);
    bucket.totalBatches += 1;
    return acc;
  }, {});

  const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
    percentage: totalBatches ? (count / totalBatches) * 100 : 0,
  }));

  const qualityBreakdown = Object.entries(qualityMap).map(
    ([quality, count]) => ({
      quality,
      count,
      percentage: totalBatches ? (count / totalBatches) * 100 : 0,
    })
  );

  const operatorPerformance = Object.entries(operatorMap)
    .map(([operator, stats]) => ({
      operator,
      batchesCompleted: stats.batchesCompleted,
      averageQuality: stats.batchesCompleted
        ? stats.totalQuality / stats.batchesCompleted
        : 0,
      averageEfficiency: stats.totalTarget
        ? (stats.totalYield / stats.totalTarget) * 100
        : 0,
    }))
    .sort((a, b) => b.batchesCompleted - a.batchesCompleted);

  const productPerformance = Object.entries(productMap)
    .map(([product, stats]) => ({
      product,
      totalYield: toFixedNumber(stats.totalYield, 2),
      totalBatches: stats.totalBatches,
      averageYield: stats.totalBatches
        ? toFixedNumber(stats.totalYield / stats.totalBatches, 2)
        : 0,
      averageEfficiency: stats.totalTarget
        ? (stats.totalYield / stats.totalTarget) * 100
        : 0,
    }))
    .sort((a, b) => b.totalYield - a.totalYield);

  return {
    summary: {
      totalBatches,
      completedBatches,
      activeBatches,
      failedBatches,
      averageProgress,
      averageEfficiency,
      averageQualityScore,
      totalTargetYield: toFixedNumber(totalTargetYield, 2),
      totalActualYield: toFixedNumber(totalActualYield, 2),
    },
    statusBreakdown,
    qualityBreakdown,
    operatorPerformance,
    productPerformance,
  };
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildReportHtml = (
  {
    metadata,
    summary,
    statusBreakdown,
    qualityBreakdown,
    operatorPerformance,
    productPerformance,
  },
  reportType
) => {
  const titleMap = {
    summary: "Production Summary Report",
    efficiency: "Production Efficiency Report",
    quality: "Production Quality Report",
    operator: "Operator Performance Report",
  };

  const title = titleMap[reportType] || titleMap.summary;
  const generatedDate = metadata.generatedAt.toLocaleString();

  const renderSummaryTable = () => `
      <table class="table">
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Batches</td><td>${summary.totalBatches}</td></tr>
        <tr><td>Completed Batches</td><td>${summary.completedBatches}</td></tr>
        <tr><td>Active Batches</td><td>${summary.activeBatches}</td></tr>
        <tr><td>Failed Batches</td><td>${summary.failedBatches}</td></tr>
        <tr><td>Average Progress</td><td>${formatPercent(
          summary.averageProgress
        )}</td></tr>
        <tr><td>Average Efficiency</td><td>${formatPercent(
          summary.averageEfficiency
        )}</td></tr>
        <tr><td>Average Quality Score</td><td>${formatPercent(
          summary.averageQualityScore
        )}</td></tr>
        <tr><td>Total Target Yield</td><td>${summary.totalTargetYield}</td></tr>
        <tr><td>Total Actual Yield</td><td>${summary.totalActualYield}</td></tr>
      </table>`;

  const renderStatusTable = () => `
      <table class="table">
        <tr><th>Status</th><th>Count</th><th>Percentage</th></tr>
        ${statusBreakdown
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(capitalize(item.status))}</td>
                <td>${item.count}</td>
                <td>${formatPercent(item.percentage)}</td>
              </tr>`
          )
          .join("")}
      </table>`;

  const renderQualityTable = () => `
      <table class="table">
        <tr><th>Quality</th><th>Count</th><th>Percentage</th></tr>
        ${qualityBreakdown
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(
                  QUALITY_LABELS[item.quality] || capitalize(item.quality)
                )}</td>
                <td>${item.count}</td>
                <td>${formatPercent(item.percentage)}</td>
              </tr>`
          )
          .join("")}
      </table>`;

  const renderOperatorTable = () => `
      <table class="table">
        <tr><th>Operator</th><th>Batches Completed</th><th>Average Quality</th><th>Average Efficiency</th></tr>
        ${operatorPerformance
          .map(
            (op) => `
              <tr>
                <td>${escapeHtml(op.operator)}</td>
                <td>${op.batchesCompleted}</td>
                <td>${formatPercent(op.averageQuality)}</td>
                <td>${formatPercent(op.averageEfficiency)}</td>
              </tr>`
          )
          .join("")}
      </table>`;

  const renderProductTable = () => `
      <table class="table">
        <tr><th>Product</th><th>Total Batches</th><th>Total Yield</th><th>Average Yield</th><th>Average Efficiency</th></tr>
        ${productPerformance
          .slice(0, 10)
          .map(
            (product) => `
              <tr>
                <td>${escapeHtml(product.product)}</td>
                <td>${product.totalBatches}</td>
                <td>${product.totalYield}</td>
                <td>${product.averageYield}</td>
                <td>${formatPercent(product.averageEfficiency)}</td>
              </tr>`
          )
          .join("")}
      </table>`;

  const sections = {
    summary: `
      <div class="section">
        <h2>Overview</h2>
        ${renderSummaryTable()}
      </div>
      <div class="section">
        <h2>Status Breakdown</h2>
        ${renderStatusTable()}
      </div>
      <div class="section">
        <h2>Top Products</h2>
        ${renderProductTable()}
      </div>`,
    efficiency: `
      <div class="section">
        <h2>Efficiency Overview</h2>
        ${renderSummaryTable()}
      </div>
      <div class="section">
        <h2>Status Efficiency</h2>
        ${renderStatusTable()}
      </div>
      <div class="section">
        <h2>Product Efficiency</h2>
        ${renderProductTable()}
      </div>`,
    quality: `
      <div class="section">
        <h2>Quality Overview</h2>
        ${renderSummaryTable()}
      </div>
      <div class="section">
        <h2>Quality Breakdown</h2>
        ${renderQualityTable()}
      </div>
      <div class="section">
        <h2>Operator Quality</h2>
        ${renderOperatorTable()}
      </div>`,
    operator: `
      <div class="section">
        <h2>Operator Overview</h2>
        ${renderSummaryTable()}
      </div>
      <div class="section">
        <h2>Operator Performance</h2>
        ${renderOperatorTable()}
      </div>
      <div class="section">
        <h2>Product Output</h2>
        ${renderProductTable()}
      </div>`,
  };

  const selectedSections = sections[reportType] || sections.summary;

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: "Helvetica", "Arial", sans-serif; margin: 24px; color: #1f2937; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      h2 { font-size: 18px; margin: 24px 0 12px; color: #1f2937; }
      p { margin: 4px 0; }
      .header { border-bottom: 2px solid #1f2937; padding-bottom: 12px; margin-bottom: 24px; }
      .meta { color: #4b5563; font-size: 12px; }
      .section { margin-bottom: 24px; }
      .table { width: 100%; border-collapse: collapse; font-size: 12px; }
      .table th { text-align: left; background: #f3f4f6; padding: 8px; border: 1px solid #d1d5db; }
      .table td { padding: 8px; border: 1px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${escapeHtml(title)}</h1>
      <p class="meta">Period: ${escapeHtml(metadata.periodLabel)}</p>
      <p class="meta">Generated: ${escapeHtml(generatedDate)}</p>
      <p class="meta">Data Source: ${escapeHtml(metadata.dataSource)}</p>
    </div>
    ${selectedSections}
  </body>
</html>`;
};

// Mock data for testing when database is not available
let mockBatches = [];
let mockIdCounter = 1;

// Helper to check if database is connected
const isDatabaseConnected = () => {
  return require("mongoose").connection.readyState === 1;
};

// ✅ Create new batch
const createBatch = async (req, res) => {
  try {
    const {
      batchName,
      product,
      quantity,
      operator,
      estimatedTime,
      startTime,
      quality,
      targetYield,
    } = req.body;

    console.log("📝 Creating batch:", {
      batchName,
      product,
      quantity,
      operator,
    });

    if (!isDatabaseConnected()) {
      console.log("⚠️ Database not connected, using mock data");
      // Mock implementation for testing
      const mockBatch = {
        _id: (mockIdCounter++).toString(),
        batchName,
        product,
        quantity: targetYield || quantity,
        targetYield: targetYield || quantity,
        operator,
        estimatedTime: estimatedTime || "1 hour",
        startTime: startTime || new Date().toISOString(),
        quality: quality || "good",
        status: "idle",
        processStatus: "getting-raw-materials",
        progress: 0,
        yield: 0,
        level: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockBatches.push(mockBatch);
      console.log("✅ Mock batch created:", mockBatch._id);
      return res.status(201).json(mockBatch);
    }

    console.log("💾 Saving to MongoDB...");
    const batch = new Production({
      batchName,
      product,
      quantity: targetYield || quantity,
      targetYield: targetYield || quantity,
      operator,
      estimatedTime: estimatedTime || "1 hour",
      startTime: startTime || new Date().toISOString(),
      quality: quality || "good",
    });

    await batch.save();
    console.log("✅ Batch saved to MongoDB:", batch._id);
    res.status(201).json(batch);
  } catch (error) {
    console.error("❌ Create batch error:", error);
    res.status(400).json({ error: error.message });
  }
};

// ✅ Get all batches
const getBatches = async (req, res) => {
  try {
    console.log("📋 Getting batches...");

    if (!isDatabaseConnected()) {
      console.log("⚠️ Database not connected, returning mock data");
      return res.status(200).json(mockBatches);
    }

    console.log("💾 Fetching from MongoDB...");
    const batches = await Production.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${batches.length} batches in MongoDB`);
    res.status(200).json(batches);
  } catch (error) {
    console.error("❌ Get batches error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update progress or status
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isDatabaseConnected()) {
      const batchIndex = mockBatches.findIndex((b) => b._id === id);
      if (batchIndex === -1)
        return res.status(404).json({ error: "Batch not found" });

      mockBatches[batchIndex] = {
        ...mockBatches[batchIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return res.status(200).json(mockBatches[batchIndex]);
    }

    const batch = await Production.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!batch) return res.status(404).json({ error: "Batch not found" });

    res.status(200).json(batch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Mark batch as completed
const completeBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      status: "completed",
      processStatus: "completed",
      progress: 100,
      completedAt: new Date(),
      endTime: new Date().toISOString(),
      level: 6,
    };

    if (!isDatabaseConnected()) {
      const batchIndex = mockBatches.findIndex((b) => b._id === id);
      if (batchIndex === -1)
        return res.status(404).json({ error: "Batch not found" });

      mockBatches[batchIndex] = {
        ...mockBatches[batchIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return res.status(200).json(mockBatches[batchIndex]);
    }

    const batch = await Production.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!batch) return res.status(404).json({ error: "Batch not found" });

    res.status(200).json(batch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Delete a batch
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const batchIndex = mockBatches.findIndex((b) => b._id === id);
      if (batchIndex === -1)
        return res.status(404).json({ error: "Batch not found" });

      mockBatches.splice(batchIndex, 1);
      return res.status(200).json({ message: "Batch deleted successfully" });
    }

    const batch = await Production.findByIdAndDelete(id);

    if (!batch) return res.status(404).json({ error: "Batch not found" });

    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate PDF report for production batches
const downloadProductionReport = async (req, res) => {
  try {
    const { type = "summary", startDate, endDate } = req.query;
    const normalizedType =
      typeof type === "string" ? type.toLowerCase() : "summary";
    const allowedTypes = new Set([
      "summary",
      "efficiency",
      "quality",
      "operator",
    ]);
    const reportType = allowedTypes.has(normalizedType)
      ? normalizedType
      : "summary";

    const startFilter = parseDate(startDate);
    const endFilter = parseDate(endDate);
    const mongoQuery = {};

    let batches;

    if (isDatabaseConnected()) {
      if (startFilter || endFilter) {
        mongoQuery.createdAt = {};
        if (startFilter) {
          mongoQuery.createdAt.$gte = startFilter;
        }
        if (endFilter) {
          const endOfDay = new Date(endFilter);
          endOfDay.setHours(23, 59, 59, 999);
          mongoQuery.createdAt.$lte = endOfDay;
        }
      }

      batches = await Production.find(mongoQuery).sort({ createdAt: -1 });
    } else {
      batches = mockBatches;
    }

    if (!batches || !batches.length) {
      return res.status(404).json({
        error: "No production batches found for the selected period.",
      });
    }

    const filteredBatches = filterBatchesByRange(
      batches,
      startFilter,
      endFilter
    );

    if (!filteredBatches.length) {
      return res.status(404).json({
        error: "No production batches found for the selected period.",
      });
    }

    const normalizedBatches = filteredBatches.map(normalizeBatchForReport);
    const metrics = buildProductionMetrics(normalizedBatches);

    const metadata = {
      reportType,
      generatedAt: new Date(),
      periodLabel: buildPeriodLabel(filteredBatches, startFilter, endFilter),
      dataSource: isDatabaseConnected()
        ? "MongoDB Production Collection"
        : "In-memory mock dataset",
    };

    const html = buildReportHtml(
      {
        metadata,
        ...metrics,
      },
      reportType
    );

    const pdfBuffer = await pdfService.generatePDF(html, {
      printBackground: true,
    });

    const dateSegment = metadata.generatedAt.toISOString().split("T")[0];
    const typeSegment =
      reportType.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") ||
      "summary";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="production-${typeSegment}-${dateSegment}.pdf"`
    );

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("❌ Generate production report error:", error);
    return res.status(500).json({
      error: "Failed to generate production report",
      details: error.message,
    });
  }
};

module.exports = {
  createBatch,
  getBatches,
  updateBatch,
  completeBatch,
  deleteBatch,
  downloadProductionReport,
};
