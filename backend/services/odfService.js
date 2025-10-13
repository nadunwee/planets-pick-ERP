const XLSX = require("xlsx");

const QUALITY_LABELS = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

const capitalize = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const toFixedNumber = (value, fractionDigits = 2) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return 0;
  }
  return Number(numberValue.toFixed(fractionDigits));
};

const formatPercent = (value) => `${toFixedNumber(value, 2)}%`;

const buildSummarySheet = ({ metadata, summary }) => {
  const rows = [
    ["Production Performance Report"],
    ["Generated At", metadata.generatedAt.toISOString()],
    ["Report Type", capitalize(metadata.reportType)],
    ["Period", metadata.periodLabel],
    ["Data Source", metadata.dataSource],
    [],
    ["Key Metric", "Value"],
    ["Total Batches", summary.totalBatches],
    ["Completed Batches", summary.completedBatches],
    ["Active Batches", summary.activeBatches],
    ["Failed Batches", summary.failedBatches],
    ["Average Progress", formatPercent(summary.averageProgress)],
    ["Average Efficiency", formatPercent(summary.averageEfficiency)],
    ["Average Quality Score", formatPercent(summary.averageQualityScore)],
    ["Total Target Yield", summary.totalTargetYield],
    ["Total Actual Yield", summary.totalActualYield],
  ];

  return XLSX.utils.aoa_to_sheet(rows);
};

const buildBreakdownSheet = (title, headers, rowsData) => {
  const rows = [[title], headers, ...rowsData];
  return XLSX.utils.aoa_to_sheet(rows);
};

const buildBatchesSheet = (batches) => {
  const formatted = batches.map((batch) => ({
    "Batch ID": batch.id,
    "Batch Name": batch.batchName,
    Product: batch.product,
    Status: capitalize(batch.status || "unknown"),
    "Process Stage": batch.processStatus,
    Operator: batch.operator,
    "Target Yield": batch.targetYield,
    "Actual Yield": batch.yield,
    Progress: formatPercent(batch.progress),
    Quality:
      QUALITY_LABELS[batch.quality] || capitalize(batch.quality || "n/a"),
    "Start Time": batch.startTime || "",
    "End Time": batch.endTime || "",
    "Created At": batch.createdAt || "",
    "Updated At": batch.updatedAt || "",
  }));

  return XLSX.utils.json_to_sheet(formatted, {
    header: [
      "Batch ID",
      "Batch Name",
      "Product",
      "Status",
      "Process Stage",
      "Operator",
      "Target Yield",
      "Actual Yield",
      "Progress",
      "Quality",
      "Start Time",
      "End Time",
      "Created At",
      "Updated At",
    ],
  });
};

const sanitizeSheetName = (name) =>
  name.replace(/[\\/?*\[\]]/g, " ").slice(0, 31) || "Sheet";

const appendSheet = (workbook, sheet, name) => {
  XLSX.utils.book_append_sheet(workbook, sheet, sanitizeSheetName(name));
};

const generateProductionReportOds = ({
  metadata,
  summary,
  statusBreakdown,
  qualityBreakdown,
  operatorPerformance,
  productPerformance,
  batches,
}) => {
  const workbook = XLSX.utils.book_new();

  appendSheet(workbook, buildSummarySheet({ metadata, summary }), "Summary");

  appendSheet(
    workbook,
    buildBreakdownSheet(
      "Status Breakdown",
      ["Status", "Count", "Percentage"],
      statusBreakdown.map((item) => [
        capitalize(item.status),
        item.count,
        formatPercent(item.percentage),
      ])
    ),
    "Statuses"
  );

  appendSheet(
    workbook,
    buildBreakdownSheet(
      "Quality Breakdown",
      ["Quality", "Count", "Percentage"],
      qualityBreakdown.map((item) => [
        QUALITY_LABELS[item.quality] || capitalize(item.quality),
        item.count,
        formatPercent(item.percentage),
      ])
    ),
    "Quality"
  );

  appendSheet(
    workbook,
    buildBreakdownSheet(
      "Operator Performance",
      [
        "Operator",
        "Completed Batches",
        "Average Quality",
        "Average Efficiency",
      ],
      operatorPerformance.map((item) => [
        item.operator,
        item.batchesCompleted,
        formatPercent(item.averageQuality),
        formatPercent(item.averageEfficiency),
      ])
    ),
    "Operators"
  );

  appendSheet(
    workbook,
    buildBreakdownSheet(
      "Product Performance",
      [
        "Product",
        "Batches",
        "Total Yield",
        "Average Yield",
        "Average Efficiency",
      ],
      productPerformance.map((item) => [
        item.product,
        item.totalBatches,
        item.totalYield,
        item.averageYield,
        formatPercent(item.averageEfficiency),
      ])
    ),
    "Products"
  );

  appendSheet(workbook, buildBatchesSheet(batches), "Batches");

  return XLSX.write(workbook, { type: "buffer", bookType: "ods" });
};

module.exports = {
  generateProductionReportOds,
};
