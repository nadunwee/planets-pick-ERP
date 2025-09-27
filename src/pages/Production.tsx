import { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  TrendingUp,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  X,
  FileText,
  Plus,
  Download,
  Clock,
  Target,
  Users,
  Activity,
  Package,
} from "lucide-react";
import { productionService } from "../components/services/productionService";
import type { ProductionBatch } from "../components/services/productionService";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface FrontendProductionBatch {
  id: string;
  productName: string;
  batchNumber: string;
  status: "idle" | "running" | "paused" | "completed" | "failed";
  processStatus:
    | "getting-raw-materials"
    | "washing-materials"
    | "preparing-materials"
    | "machine-1"
    | "machine-2"
    | "machine-3"
    | "completed"
    | "failed";
  progress: number;
  estimatedTime: string;
  actualTime?: string;
  operator: string;
  startTime: string;
  endTime?: string;
  yield: number;
  targetYield: number;
  quality: "excellent" | "good" | "fair" | "poor";
  level: number;
}

interface ProductionLine {
  id: string;
  name: string;
  status: "active" | "idle" | "maintenance";
  currentBatch?: string;
  efficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface QualityMetric {
  parameter: string;
  value: number;
  unit: string;
  target: number;
  status: "excellent" | "good" | "warning" | "critical";
}

interface BatchFormData {
  date: string;
  time: string;
  batchNo: string;
  batchType: string;
  batchItem: string;
  qty: number;
  qualityChecked: boolean;
  operatorName: string;
}

interface ProductionAnalytics {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  averageEfficiency: number;
  totalOutput: number;
  averageQuality: number;
  onTimeDelivery: number;
  machineUtilization: number;
}

interface ProductionReport {
  reportType: string;
  period: string;
  totalProduction: number;
  efficiency: number;
  qualityScore: number;
  topPerformingProducts: Array<{
    product: string;
    quantity: number;
    efficiency: number;
  }>;
  operatorPerformance: Array<{
    operator: string;
    batchesCompleted: number;
    averageQuality: number;
  }>;
  machinePerformance: Array<{
    machine: string;
    utilization: number;
    downtime: number;
  }>;
}

const productionLines: ProductionLine[] = [
  {
    id: "1",
    name: "Oil Extraction Line A",
    status: "active",
    currentBatch: "VCO-2024-045",
    efficiency: 92,
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-01-25",
  },
  {
    id: "2",
    name: "Drying Line B",
    status: "idle",
    efficiency: 88,
    lastMaintenance: "2024-01-12",
    nextMaintenance: "2024-01-27",
  },
  {
    id: "3",
    name: "Packaging Line C",
    status: "maintenance",
    efficiency: 0,
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-01-30",
  },
];

const qualityMetrics: QualityMetric[] = [
  {
    parameter: "Moisture Content",
    value: 2.1,
    unit: "%",
    target: 2.0,
    status: "good",
  },
  {
    parameter: "Free Fatty Acid",
    value: 0.05,
    unit: "%",
    target: 0.1,
    status: "excellent",
  },
  {
    parameter: "Peroxide Value",
    value: 0.8,
    unit: "meq/kg",
    target: 1.0,
    status: "excellent",
  },
  {
    parameter: "Color",
    value: 8.2,
    unit: "Lovibond",
    target: 8.0,
    status: "warning",
  },
];

export default function Production() {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<string | null>(null);
  const [productionBatches, setProductionBatches] = useState<
    FrontendProductionBatch[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "reports"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");

  // Transform backend batch to frontend format
  const transformBackendBatch = (
    backendBatch: ProductionBatch
  ): FrontendProductionBatch => {
    return {
      id: backendBatch._id || backendBatch.id || "",
      productName: backendBatch.product,
      batchNumber: backendBatch.batchName,
      status: backendBatch.status,
      processStatus: backendBatch.processStatus,
      progress: backendBatch.progress,
      estimatedTime: backendBatch.estimatedTime,
      actualTime: backendBatch.actualTime,
      operator: backendBatch.operator,
      startTime: backendBatch.startTime,
      endTime: backendBatch.endTime,
      yield: backendBatch.yield,
      targetYield: backendBatch.targetYield,
      quality: backendBatch.quality,
      level: backendBatch.level,
    };
  };

  // Load production batches on component mount
  useEffect(() => {
    const loadBatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const batches = await productionService.getBatches();
        const transformedBatches = batches.map(transformBackendBatch);
        setProductionBatches(transformedBatches);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load batches");
        console.error("Error loading batches:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);
  const [batchFormData, setBatchFormData] = useState<BatchFormData>({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    batchNo: "",
    batchType: "",
    batchItem: "",
    qty: 0,
    qualityChecked: false,
    operatorName: "",
  });

  // Calculate production analytics
  const productionAnalytics = useMemo((): ProductionAnalytics => {
    const totalBatches = productionBatches.length;
    const activeBatches = productionBatches.filter(
      (batch) => batch.status === "running" || batch.status === "paused"
    ).length;
    const completedBatches = productionBatches.filter(
      (batch) => batch.status === "completed"
    ).length;

    const totalOutput = productionBatches.reduce(
      (sum, batch) => sum + batch.yield,
      0
    );
    const targetOutput = productionBatches.reduce(
      (sum, batch) => sum + batch.targetYield,
      0
    );
    const averageEfficiency =
      targetOutput > 0 ? (totalOutput / targetOutput) * 100 : 0;

    const qualityScores = productionBatches.map((batch) => {
      switch (batch.quality) {
        case "excellent":
          return 100;
        case "good":
          return 80;
        case "fair":
          return 60;
        case "poor":
          return 40;
        default:
          return 50;
      }
    });
    const averageQuality =
      qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) /
          qualityScores.length
        : 0;

    const onTimeBatches = productionBatches.filter(
      (batch) => batch.status === "completed" && batch.progress >= 95
    ).length;
    const onTimeDelivery =
      completedBatches > 0 ? (onTimeBatches / completedBatches) * 100 : 0;

    const machineUtilization =
      productionLines.reduce((sum, line) => sum + line.efficiency, 0) /
      productionLines.length;

    return {
      totalBatches,
      activeBatches,
      completedBatches,
      averageEfficiency: Math.round(averageEfficiency),
      totalOutput: Math.round(totalOutput),
      averageQuality: Math.round(averageQuality),
      onTimeDelivery: Math.round(onTimeDelivery),
      machineUtilization: Math.round(machineUtilization),
    };
  }, [productionBatches]);

  // Generate chart data
  const chartData = useMemo(() => {
    const statusCounts = productionBatches.reduce((acc, batch) => {
      acc[batch.status] = (acc[batch.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const productCounts = productionBatches.reduce((acc, batch) => {
      acc[batch.productName] = (acc[batch.productName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyProduction = productionBatches.reduce((acc, batch) => {
      const date = batch.startTime.split(" ")[0];
      acc[date] = (acc[date] || 0) + batch.yield;
      return acc;
    }, {} as Record<string, number>);

    return {
      statusChart: {
        labels: Object.keys(statusCounts),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: [
              "rgba(34, 197, 94, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(16, 185, 129, 0.8)",
              "rgba(239, 68, 68, 0.8)",
            ],
          },
        ],
      },
      productChart: {
        labels: Object.keys(productCounts),
        datasets: [
          {
            label: "Production Count",
            data: Object.values(productCounts),
            backgroundColor: "rgba(59, 130, 246, 0.8)",
          },
        ],
      },
      productionTrend: {
        labels: Object.keys(dailyProduction).sort(),
        datasets: [
          {
            label: "Daily Production (L)",
            data: Object.keys(dailyProduction)
              .sort()
              .map((date) => dailyProduction[date]),
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
          },
        ],
      },
    };
  }, [productionBatches]);

  // Filter and search production batches
  const filteredBatches = useMemo(() => {
    return productionBatches.filter((batch) => {
      // Search term filter (searches batch number, product name, and operator)
      const matchesSearch =
        searchTerm === "" ||
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.operator.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || batch.status === statusFilter;

      // Operator filter
      const matchesOperator =
        operatorFilter === "all" || batch.operator === operatorFilter;

      return matchesSearch && matchesStatus && matchesOperator;
    });
  }, [productionBatches, searchTerm, statusFilter, operatorFilter]);

  // Get unique operators for filter dropdown
  const uniqueOperators = useMemo(() => {
    const operators = [
      ...new Set(productionBatches.map((batch) => batch.operator)),
    ];
    return operators.sort();
  }, [productionBatches]);

  const handleInputChange = (
    field: keyof BatchFormData,
    value: string | number | boolean
  ) => {
    setBatchFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);

      if (editingBatch) {
        // Update existing batch
        const updates = {
          batchName: batchFormData.batchNo,
          product: batchFormData.batchItem,
          targetYield: batchFormData.qty,
          operator: batchFormData.operatorName,
          estimatedTime: "1 hour",
          startTime: `${batchFormData.date} ${batchFormData.time}`,
          quality: (batchFormData.qualityChecked ? "excellent" : "good") as "excellent" | "good",
        };

        const updatedBatch = await productionService.updateBatch(
          editingBatch,
          updates
        );
        const transformedBatch = transformBackendBatch(updatedBatch);

        setProductionBatches((prev) =>
          prev.map((batch) =>
            batch.id === editingBatch ? transformedBatch : batch
          )
        );
        setEditingBatch(null);
      } else {
        // Create new batch
        const newBatchData = {
          batchName: batchFormData.batchNo,
          product: batchFormData.batchItem,
          quantity: batchFormData.qty,
          targetYield: batchFormData.qty,
          operator: batchFormData.operatorName || "Current User",
          estimatedTime: "1 hour",
          startTime: `${batchFormData.date} ${batchFormData.time}`,
          quality: (batchFormData.qualityChecked ? "excellent" : "good") as "excellent" | "good",
        };

        const createdBatch = await productionService.createBatch(newBatchData);
        const transformedBatch = transformBackendBatch(createdBatch);

        setProductionBatches((prev) => [...prev, transformedBatch]);
      }

      // Reset form and close modal
      setBatchFormData({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        batchNo: "",
        batchType: "",
        batchItem: "",
        qty: 0,
        qualityChecked: false,
        operatorName: "",
      });
      setShowBatchForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save batch");
      console.error("Error saving batch:", err);
    }
  };

  const resetForm = () => {
    setBatchFormData({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      batchNo: "",
      batchType: "",
      batchItem: "",
      qty: 0,
      qualityChecked: false,
      operatorName: "",
    });
    setEditingBatch(null);
  };

  const handleEditBatch = (batch: FrontendProductionBatch) => {
    setEditingBatch(batch.id);

    // Parse the startTime properly
    let dateValue = new Date().toISOString().split("T")[0];
    let timeValue = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    if (batch.startTime) {
      // Handle different date formats
      if (batch.startTime.includes(" ")) {
        // Format: "2024-01-15 14:00"
        const [datePart, timePart] = batch.startTime.split(" ");
        dateValue = datePart;
        timeValue = timePart || timeValue;
      } else if (batch.startTime.includes("T")) {
        // Format: "2024-01-15T14:00:00.000Z"
        const [datePart, timePart] = batch.startTime.split("T");
        dateValue = datePart;
        timeValue = timePart.split(".")[0].substring(0, 5) || timeValue;
      } else {
        // Try to parse as ISO date
        try {
          const date = new Date(batch.startTime);
          dateValue = date.toISOString().split("T")[0];
          timeValue = date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (e) {
          console.warn("Could not parse startTime:", batch.startTime);
        }
      }
    }

    const formData = {
      date: dateValue,
      time: timeValue,
      batchNo: batch.batchNumber,
      batchType: "processing",
      batchItem: batch.productName,
      qty: batch.targetYield,
      qualityChecked: batch.quality === "excellent",
      operatorName: batch.operator,
    };

    setBatchFormData(formData);
    setShowBatchForm(true);
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        setError(null);
        await productionService.deleteBatch(batchId);
        setProductionBatches((prev) =>
          prev.filter((batch) => batch.id !== batchId)
        );
        if (selectedBatch === batchId) {
          setSelectedBatch(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete batch");
        console.error("Error deleting batch:", err);
      }
    }
  };

  const handleUpdateBatchStatus = async (
    batchId: string,
    updates: Partial<FrontendProductionBatch>
  ) => {
    try {
      setError(null);
      const backendUpdates = {
        status: updates.status,
        processStatus: updates.processStatus,
        progress: updates.progress,
        level: updates.level,
        endTime: updates.endTime,
      };

      const updatedBatch = await productionService.updateBatch(
        batchId,
        backendUpdates
      );
      const transformedBatch = transformBackendBatch(updatedBatch);

      setProductionBatches((prev) =>
        prev.map((batch) => (batch.id === batchId ? transformedBatch : batch))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update batch");
      console.error("Error updating batch:", err);
    }
  };

  const handleCompleteBatch = async (batchId: string) => {
    try {
      setError(null);
      const completedBatch = await productionService.completeBatch(batchId);
      const transformedBatch = transformBackendBatch(completedBatch);

      setProductionBatches((prev) =>
        prev.map((batch) => (batch.id === batchId ? transformedBatch : batch))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete batch");
      console.error("Error completing batch:", err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "idle":
        return <Settings className="text-gray-500" size={16} />;
      case "running":
        return <Play className="text-green-500" size={16} />;
      case "paused":
        return <Pause className="text-yellow-500" size={16} />;
      case "completed":
        return <CheckCircle className="text-blue-500" size={16} />;
      case "failed":
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Settings className="text-gray-500" size={16} />;
    }
  };

  const getQualityColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getProcessStatusDisplay = (status: string) => {
    switch (status) {
      case "getting-raw-materials":
        return "Getting Raw Materials";
      case "washing-materials":
        return "Washing Materials";
      case "preparing-materials":
        return "Preparing Materials";
      case "machine-1":
        return "Machine 1";
      case "machine-2":
        return "Machine 2";
      case "machine-3":
        return "Machine 3";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  // Report generation functions
  const generateProductionReport = (reportType: string): ProductionReport => {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    const topProducts = Object.entries(
      productionBatches.reduce((acc, batch) => {
        acc[batch.productName] = (acc[batch.productName] || 0) + batch.yield;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([product, quantity]) => ({
        product,
        quantity,
        efficiency: 85 + Math.random() * 15, // Mock efficiency
      }));

    const operatorStats = Object.entries(
      productionBatches.reduce((acc, batch) => {
        if (!acc[batch.operator]) {
          acc[batch.operator] = { batches: 0, totalQuality: 0 };
        }
        acc[batch.operator].batches++;
        const qualityScore =
          batch.quality === "excellent"
            ? 100
            : batch.quality === "good"
            ? 80
            : batch.quality === "fair"
            ? 60
            : 40;
        acc[batch.operator].totalQuality += qualityScore;
        return acc;
      }, {} as Record<string, { batches: number; totalQuality: number }>)
    ).map(([operator, stats]) => ({
      operator,
      batchesCompleted: stats.batches,
      averageQuality: Math.round(stats.totalQuality / stats.batches),
    }));

    return {
      reportType,
      period,
      totalProduction: productionAnalytics.totalOutput,
      efficiency: productionAnalytics.averageEfficiency,
      qualityScore: productionAnalytics.averageQuality,
      topPerformingProducts: topProducts,
      operatorPerformance: operatorStats,
      machinePerformance: productionLines.map((line) => ({
        machine: line.name,
        utilization: line.efficiency,
        downtime: 100 - line.efficiency,
      })),
    };
  };

  const downloadReport = (reportType: string) => {
    const report = generateProductionReport(reportType);
    const date = new Date().toISOString().split("T")[0];

    let content = "";
    let filename = "";

    switch (reportType) {
      case "summary":
        content = generateProductionSummaryHTML(report);
        filename = `Production_Summary_${date}.html`;
        break;
      case "efficiency":
        content = generateEfficiencyReportHTML(report);
        filename = `Production_Efficiency_Report_${date}.html`;
        break;
      case "quality":
        content = generateQualityReportHTML(report);
        filename = `Production_Quality_Report_${date}.html`;
        break;
      case "operator":
        content = generateOperatorReportHTML(report);
        filename = `Operator_Performance_Report_${date}.html`;
        break;
    }

    const blob = new Blob([content], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setTimeout(() => {
      alert(
        'Report downloaded! To convert to PDF:\n1. Open the downloaded HTML file in your browser\n2. Press Ctrl+P (Cmd+P on Mac)\n3. Select "Save as PDF" as destination\n4. Click Save'
      );
    }, 100);
  };

  const generateProductionSummaryHTML = (report: ProductionReport) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Production Summary Report</title>
  <style>
    @page { margin: 0.5in; }
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 0; 
      padding: 0;
      font-size: 12px;
      line-height: 1.4;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    .company-name { 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    .report-title { 
      font-size: 18px; 
      font-weight: bold; 
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .section { margin: 30px 0; }
    .section-title { 
      font-size: 14px; 
      font-weight: bold; 
      margin-bottom: 15px;
      text-decoration: underline;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 10px 0;
      font-size: 11px;
    }
    th, td { 
      border: 1px solid #000; 
      padding: 8px 12px; 
      text-align: left;
    }
    th { 
      background-color: #f0f0f0; 
      font-weight: bold;
      text-align: center;
    }
    .amount { text-align: right; }
    .total { 
      font-weight: bold; 
      border-top: 2px solid #000;
      background-color: #f8f8f8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">PLANETS PICK ERP SYSTEM</div>
    <div class="report-title">Production Summary Report</div>
    <div>Period: ${report.period}</div>
    <div>Generated: ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="section">
    <div class="section-title">Production Overview</div>
    <table>
      <tr>
        <th>Metric</th>
        <th class="amount">Value</th>
      </tr>
      <tr>
        <td>Total Production</td>
        <td class="amount">${report.totalProduction} L</td>
      </tr>
      <tr>
        <td>Overall Efficiency</td>
        <td class="amount">${report.efficiency}%</td>
      </tr>
      <tr>
        <td>Quality Score</td>
        <td class="amount">${report.qualityScore}%</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Top Performing Products</div>
    <table>
      <tr>
        <th>Product</th>
        <th class="amount">Quantity (L)</th>
        <th class="amount">Efficiency (%)</th>
      </tr>
      ${report.topPerformingProducts
        .map(
          (product) => `
        <tr>
          <td>${product.product}</td>
          <td class="amount">${product.quantity.toLocaleString()}</td>
          <td class="amount">${product.efficiency.toFixed(1)}%</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Machine Performance</div>
    <table>
      <tr>
        <th>Machine</th>
        <th class="amount">Utilization (%)</th>
        <th class="amount">Downtime (%)</th>
      </tr>
      ${report.machinePerformance
        .map(
          (machine) => `
        <tr>
          <td>${machine.machine}</td>
          <td class="amount">${machine.utilization}%</td>
          <td class="amount">${machine.downtime}%</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>
</body>
</html>
    `;
  };

  const generateEfficiencyReportHTML = (report: ProductionReport) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Production Efficiency Report</title>
  <style>
    @page { margin: 0.5in; }
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 0; 
      padding: 0;
      font-size: 12px;
      line-height: 1.4;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    .company-name { 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    .report-title { 
      font-size: 18px; 
      font-weight: bold; 
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .section { margin: 30px 0; }
    .section-title { 
      font-size: 14px; 
      font-weight: bold; 
      margin-bottom: 15px;
      text-decoration: underline;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 10px 0;
      font-size: 11px;
    }
    th, td { 
      border: 1px solid #000; 
      padding: 8px 12px; 
      text-align: left;
    }
    th { 
      background-color: #f0f0f0; 
      font-weight: bold;
      text-align: center;
    }
    .amount { text-align: right; }
    .total { 
      font-weight: bold; 
      border-top: 2px solid #000;
      background-color: #f8f8f8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">PLANETS PICK ERP SYSTEM</div>
    <div class="report-title">Production Efficiency Report</div>
    <div>Period: ${report.period}</div>
    <div>Generated: ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="section">
    <div class="section-title">Efficiency Metrics</div>
    <table>
      <tr>
        <th>Metric</th>
        <th class="amount">Value</th>
        <th>Status</th>
      </tr>
      <tr>
        <td>Overall Efficiency</td>
        <td class="amount">${report.efficiency}%</td>
        <td>${
          report.efficiency >= 90
            ? "Excellent"
            : report.efficiency >= 80
            ? "Good"
            : "Needs Improvement"
        }</td>
      </tr>
      <tr>
        <td>Machine Utilization</td>
        <td class="amount">${productionAnalytics.machineUtilization}%</td>
        <td>${
          productionAnalytics.machineUtilization >= 85
            ? "Optimal"
            : "Below Target"
        }</td>
      </tr>
      <tr>
        <td>On-Time Delivery</td>
        <td class="amount">${productionAnalytics.onTimeDelivery}%</td>
        <td>${
          productionAnalytics.onTimeDelivery >= 95 ? "Excellent" : "Good"
        }</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Product Efficiency Analysis</div>
    <table>
      <tr>
        <th>Product</th>
        <th class="amount">Production Volume</th>
        <th class="amount">Efficiency</th>
        <th>Recommendation</th>
      </tr>
      ${report.topPerformingProducts
        .map(
          (product) => `
        <tr>
          <td>${product.product}</td>
          <td class="amount">${product.quantity.toLocaleString()} L</td>
          <td class="amount">${product.efficiency.toFixed(1)}%</td>
          <td>${
            product.efficiency >= 90
              ? "Maintain current process"
              : "Review production parameters"
          }</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>
</body>
</html>
    `;
  };

  const generateQualityReportHTML = (report: ProductionReport) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Production Quality Report</title>
  <style>
    @page { margin: 0.5in; }
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 0; 
      padding: 0;
      font-size: 12px;
      line-height: 1.4;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    .company-name { 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    .report-title { 
      font-size: 18px; 
      font-weight: bold; 
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .section { margin: 30px 0; }
    .section-title { 
      font-size: 14px; 
      font-weight: bold; 
      margin-bottom: 15px;
      text-decoration: underline;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 10px 0;
      font-size: 11px;
    }
    th, td { 
      border: 1px solid #000; 
      padding: 8px 12px; 
      text-align: left;
    }
    th { 
      background-color: #f0f0f0; 
      font-weight: bold;
      text-align: center;
    }
    .amount { text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">PLANETS PICK ERP SYSTEM</div>
    <div class="report-title">Production Quality Report</div>
    <div>Period: ${report.period}</div>
    <div>Generated: ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="section">
    <div class="section-title">Quality Control Metrics</div>
    <table>
      <tr>
        <th>Parameter</th>
        <th>Current Value</th>
        <th>Target</th>
        <th>Status</th>
      </tr>
      ${qualityMetrics
        .map(
          (metric) => `
        <tr>
          <td>${metric.parameter}</td>
          <td class="amount">${metric.value} ${metric.unit}</td>
          <td class="amount">${metric.target} ${metric.unit}</td>
          <td>${
            metric.status.charAt(0).toUpperCase() + metric.status.slice(1)
          }</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Quality Summary</div>
    <table>
      <tr>
        <th>Metric</th>
        <th class="amount">Value</th>
      </tr>
      <tr>
        <td>Overall Quality Score</td>
        <td class="amount">${report.qualityScore}%</td>
      </tr>
      <tr>
        <td>Quality Compliance</td>
        <td class="amount">${report.qualityScore >= 90 ? "95%" : "85%"}</td>
      </tr>
    </table>
  </div>
</body>
</html>
    `;
  };

  const generateOperatorReportHTML = (report: ProductionReport) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Operator Performance Report</title>
  <style>
    @page { margin: 0.5in; }
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 0; 
      padding: 0;
      font-size: 12px;
      line-height: 1.4;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    .company-name { 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    .report-title { 
      font-size: 18px; 
      font-weight: bold; 
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .section { margin: 30px 0; }
    .section-title { 
      font-size: 14px; 
      font-weight: bold; 
      margin-bottom: 15px;
      text-decoration: underline;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 10px 0;
      font-size: 11px;
    }
    th, td { 
      border: 1px solid #000; 
      padding: 8px 12px; 
      text-align: left;
    }
    th { 
      background-color: #f0f0f0; 
      font-weight: bold;
      text-align: center;
    }
    .amount { text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">PLANETS PICK ERP SYSTEM</div>
    <div class="report-title">Operator Performance Report</div>
    <div>Period: ${report.period}</div>
    <div>Generated: ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="section">
    <div class="section-title">Operator Performance</div>
    <table>
      <tr>
        <th>Operator</th>
        <th class="amount">Batches Completed</th>
        <th class="amount">Average Quality</th>
        <th>Performance Rating</th>
      </tr>
      ${report.operatorPerformance
        .map(
          (op) => `
        <tr>
          <td>${op.operator}</td>
          <td class="amount">${op.batchesCompleted}</td>
          <td class="amount">${op.averageQuality}%</td>
          <td>${
            op.averageQuality >= 90
              ? "Excellent"
              : op.averageQuality >= 80
              ? "Good"
              : "Needs Improvement"
          }</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>
</body>
</html>
    `;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Production Management
          </h1>
          <p className="text-gray-600">
            Monitor and control production processes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBatchForm(!showBatchForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={16} />
            {showBatchForm ? "Hide Form" : "Start Batch"}
          </button>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const batches = await productionService.getBatches();
                const transformedBatches = batches.map(transformBackendBatch);
                setProductionBatches(transformedBatches);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Failed to refresh data"
                );
                console.error("Error refreshing data:", err);
              } finally {
                setLoading(false);
              }
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition"
          >
            <Activity size={16} />
            Refresh Data
          </button>
          <button
            onClick={() => setShowReportsModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Download size={16} />
            Download Reports
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Activity className="inline-block w-4 h-4 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <BarChart3 className="inline-block w-4 h-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reports"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText className="inline-block w-4 h-4 mr-2" />
            Reports
          </button>
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow border p-6 text-center">
          <p className="text-gray-600">Loading production batches...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Start Batch Form Section */}
      {showBatchForm && (
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingBatch
                ? "Edit Production Batch"
                : "Start New Production Batch"}
            </h2>
            <button
              onClick={() => {
                setShowBatchForm(false);
                setEditingBatch(null);
              }}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmitBatch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={batchFormData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={batchFormData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number *
                </label>
                <input
                  type="text"
                  required
                  value={batchFormData.batchNo}
                  onChange={(e) => handleInputChange("batchNo", e.target.value)}
                  placeholder="e.g., VCO-2024-046"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Type *
                </label>
                <select
                  required
                  value={batchFormData.batchType}
                  onChange={(e) =>
                    handleInputChange("batchType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select batch type</option>
                  <option value="oil-extraction">Oil Extraction</option>
                  <option value="drying">Drying</option>
                  <option value="packaging">Packaging</option>
                  <option value="processing">Processing</option>
                  <option value="quality-control">Quality Control</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Item *
                </label>
                <select
                  required
                  value={batchFormData.batchItem}
                  onChange={(e) =>
                    handleInputChange("batchItem", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select batch item</option>
                  <option value="Virgin Coconut Oil">Virgin Coconut Oil</option>
                  <option value="Dried Jackfruit">Dried Jackfruit</option>
                  <option value="Coconut Flour">Coconut Flour</option>
                  <option value="Coconut Milk">Coconut Milk</option>
                  <option value="Coconut Sugar">Coconut Sugar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={batchFormData.qty}
                  onChange={(e) =>
                    handleInputChange("qty", parseInt(e.target.value) || 0)
                  }
                  placeholder="Enter quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator Name *
              </label>
              <input
                type="text"
                required
                value={batchFormData.operatorName}
                onChange={(e) =>
                  handleInputChange("operatorName", e.target.value)
                }
                placeholder="Enter operator name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="qualityChecked"
                checked={batchFormData.qualityChecked}
                onChange={(e) =>
                  handleInputChange("qualityChecked", e.target.checked)
                }
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="qualityChecked"
                className="ml-2 block text-sm text-gray-700"
              >
                Quality Checked
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
              >
                {editingBatch ? "Update Batch" : "Start Batch"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Insights Banner */}
      {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">AI Production Insights</h3>
            <p className="text-blue-700 text-sm">
              Based on current conditions, switching to batch VCO-2024-046 could increase efficiency by 12%. 
              Optimal production window: 10:00 AM - 2:00 PM.
            </p>
          </div>
          <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
            Apply Suggestion
          </button>
        </div>
      </div> */}

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Batches</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {productionAnalytics.totalBatches}
                  </p>
                </div>
                <Target className="text-indigo-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Batches</p>
                  <p className="text-2xl font-bold text-green-600">
                    {productionAnalytics.activeBatches}
                  </p>
                </div>
                <Play className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Efficiency</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {productionAnalytics.averageEfficiency}%
                  </p>
                </div>
                <TrendingUp className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Output</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {productionAnalytics.totalOutput}L
                  </p>
                </div>
                <Package className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {productionAnalytics.averageQuality}%
                  </p>
                </div>
                <CheckCircle className="text-yellow-500" size={24} />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Production Batches */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">
                      Production Batches
                    </h2>
                    <div className="text-sm text-gray-500">
                      {filteredBatches.length} of {productionBatches.length}{" "}
                      batches
                    </div>
                  </div>

                  {/* Search and Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search Bar */}
                    <div className="md:col-span-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by batch number, product, or operator..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Statuses</option>
                        <option value="idle">Idle</option>
                        <option value="running">Running</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    {/* Operator Filter */}
                    <div>
                      <select
                        value={operatorFilter}
                        onChange={(e) => setOperatorFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Operators</option>
                        {uniqueOperators.map((operator) => (
                          <option key={operator} value={operator}>
                            {operator}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {(searchTerm ||
                    statusFilter !== "all" ||
                    operatorFilter !== "all") && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setOperatorFilter("all");
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  {filteredBatches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <p className="mt-2">
                        No batches found matching your search criteria
                      </p>
                      {(searchTerm ||
                        statusFilter !== "all" ||
                        operatorFilter !== "all") && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                            setOperatorFilter("all");
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-800 underline"
                        >
                          Clear filters to see all batches
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredBatches.map((batch) => (
                      <div
                        key={batch.id}
                        className={`border rounded-lg p-4 cursor-pointer transition ${
                          selectedBatch === batch.id
                            ? "border-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedBatch(batch.id)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">
                              {batch.productName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {batch.batchNumber}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(batch.status)}
                            <span className="text-sm capitalize font-medium">
                              {batch.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Operator</p>
                            <p className="text-sm font-medium">
                              {batch.operator}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Time Remaining
                            </p>
                            <p className="text-sm font-medium">
                              {batch.estimatedTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Yield</p>
                            <p className="text-sm font-medium">
                              {batch.yield}/{batch.targetYield} L
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Quality</p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getQualityColor(
                                batch.quality
                              )}`}
                            >
                              {batch.quality}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">
                              Process Status
                            </span>
                            <span className="text-sm font-medium">
                              {getProcessStatusDisplay(batch.processStatus)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Level</span>
                            <span className="text-sm font-medium">
                              {batch.level}/6
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{batch.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                batch.processStatus === "completed"
                                  ? "bg-green-500"
                                  : batch.processStatus === "failed"
                                  ? "bg-red-500"
                                  : batch.processStatus === "machine-3"
                                  ? "bg-purple-500"
                                  : batch.processStatus === "machine-2"
                                  ? "bg-blue-500"
                                  : batch.processStatus === "machine-1"
                                  ? "bg-indigo-500"
                                  : batch.processStatus ===
                                    "preparing-materials"
                                  ? "bg-yellow-500"
                                  : batch.processStatus === "washing-materials"
                                  ? "bg-orange-500"
                                  : batch.processStatus ===
                                    "getting-raw-materials"
                                  ? "bg-gray-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${batch.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition">
                            View Details
                          </button>
                          {batch.status === "running" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateBatchStatus(batch.id, {
                                  status: "paused",
                                });
                              }}
                              className="bg-yellow-600 text-white py-1 px-3 rounded text-sm hover:bg-yellow-700 transition"
                            >
                              Pause
                            </button>
                          )}
                          {batch.status === "paused" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateBatchStatus(batch.id, {
                                  status: "running",
                                });
                              }}
                              className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition"
                            >
                              Resume
                            </button>
                          )}
                          {batch.status !== "completed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteBatch(batch.id);
                              }}
                              className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition"
                            >
                              Complete
                            </button>
                          )}
                          {batch.status === "idle" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateBatchStatus(batch.id, {
                                  status: "running",
                                  progress: 10,
                                  level: 1,
                                  processStatus: "getting-raw-materials",
                                });
                              }}
                              className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition"
                            >
                              Start
                            </button>
                          )}
                          {batch.status === "running" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateBatchStatus(batch.id, {
                                  status: "paused",
                                });
                              }}
                              className="bg-yellow-600 text-white py-1 px-3 rounded text-sm hover:bg-yellow-700 transition"
                            >
                              Pause
                            </button>
                          )}
                          {batch.status === "paused" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateBatchStatus(batch.id, {
                                  status: "running",
                                });
                              }}
                              className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition"
                            >
                              Resume
                            </button>
                          )}
                          {batch.status === "running" && batch.level < 6 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newLevel = batch.level + 1;
                                const newProgress = Math.min(
                                  batch.progress + 15,
                                  100
                                );
                                let newProcessStatus = batch.processStatus;

                                // Update process status based on level
                                if (newLevel === 1)
                                  newProcessStatus = "getting-raw-materials";
                                else if (newLevel === 2)
                                  newProcessStatus = "washing-materials";
                                else if (newLevel === 3)
                                  newProcessStatus = "preparing-materials";
                                else if (newLevel === 4)
                                  newProcessStatus = "machine-1";
                                else if (newLevel === 5)
                                  newProcessStatus = "machine-2";
                                else if (newLevel === 6)
                                  newProcessStatus = "machine-3";

                                handleUpdateBatchStatus(batch.id, {
                                  level: newLevel,
                                  progress: newProgress,
                                  processStatus: newProcessStatus,
                                });
                              }}
                              className="bg-orange-600 text-white py-1 px-3 rounded text-sm hover:bg-orange-700 transition"
                            >
                              Level +
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBatch(batch);
                            }}
                            className="bg-purple-600 text-white py-1 px-3 rounded text-sm hover:bg-purple-700 transition"
                            disabled={batch.status === "completed"}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBatch(batch.id);
                            }}
                            className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Production Lines Status */}
              <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-lg">Production Lines</h2>
                </div>
                <div className="p-4">
                  <div className="grid gap-4">
                    {productionLines.map((line) => (
                      <div key={line.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{line.name}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              line.status === "active"
                                ? "bg-green-100 text-green-600"
                                : line.status === "idle"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {line.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Efficiency</p>
                            <p className="font-medium">{line.efficiency}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Maintenance</p>
                            <p className="font-medium">
                              {line.lastMaintenance}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Next Maintenance</p>
                            <p className="font-medium">
                              {line.nextMaintenance}
                            </p>
                          </div>
                        </div>
                        {line.currentBatch && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-gray-500">
                              Current Batch
                            </p>
                            <p className="text-sm font-medium">
                              {line.currentBatch}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Control & AI Section */}
            <div className="space-y-6">
              {/* AI Production Assistant */}
              {/* <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="p-4 border-b border-purple-200">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Bot className="text-purple-600" size={20} />
                AI Production Assistant
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">
                  Optimization Suggestion
                </h4>
                <p className="text-xs text-gray-600">
                  Increase VCO extraction temperature by 2°C to improve yield by
                  8%
                </p>
                <button className="mt-2 text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition">
                  Apply
                </button>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">
                  Predictive Maintenance
                </h4>
                <p className="text-xs text-gray-600">
                  Line A filter replacement recommended in 3 days
                </p>
                <button className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition">
                  Schedule
                </button>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">Quality Alert</h4>
                <p className="text-xs text-gray-600">
                  Color values trending above target - adjust processing time
                </p>
                <button className="mt-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition">
                  Investigate
                </button>
              </div>
            </div>
          </div> */}

              {/* Quality Metrics */}
              <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-lg">Quality Control</h2>
                </div>
                <div className="p-4 space-y-3">
                  {qualityMetrics.map((metric, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-sm">
                          {metric.parameter}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getQualityColor(
                            metric.status
                          )}`}
                        >
                          {metric.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>
                          {metric.value} {metric.unit}
                        </span>
                        <span className="text-gray-500">
                          Target: {metric.target} {metric.unit}
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${
                            metric.status === "excellent"
                              ? "bg-green-500"
                              : metric.status === "good"
                              ? "bg-blue-500"
                              : metric.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (metric.value / metric.target) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-lg">Quick Actions</h2>
                </div>
                <div className="p-4 space-y-2">
                  <button className="w-full bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition text-sm">
                    Emergency Stop All
                  </button>
                  <br></br>
                  <br></br>
                  <button className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-sm">
                    Generate Report
                  </button>
                  <br></br>
                  <br></br>
                  <button className="w-full bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 transition text-sm">
                    Schedule Maintenance
                  </button>
                  <br></br>
                  <br></br>
                  <button className="w-full bg-yellow-600 text-white py-2 px-3 rounded hover:bg-yellow-700 transition text-sm">
                    Quality Inspection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={20} />
                Production Status Distribution
              </h3>
              <div className="h-64">
                <Doughnut
                  data={chartData.statusChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-600" size={20} />
                Product Production Volume
              </h3>
              <div className="h-64">
                <Bar
                  data={chartData.productChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-purple-600" size={20} />
              Daily Production Trend
            </h3>
            <div className="h-64">
              <Line
                data={chartData.productionTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Machine Utilization</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {productionAnalytics.machineUtilization}%
                  </p>
                </div>
                <Settings className="text-indigo-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On-Time Delivery</p>
                  <p className="text-2xl font-bold text-green-600">
                    {productionAnalytics.onTimeDelivery}%
                  </p>
                </div>
                <Clock className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Batches</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {productionAnalytics.totalBatches}
                  </p>
                </div>
                <Target className="text-blue-500" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Production Reports
            </h3>
            <p className="text-gray-600 mb-6">
              Generate comprehensive reports for production analysis, efficiency
              tracking, and quality control.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => downloadReport("summary")}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BarChart3 className="text-blue-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Production Summary
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Complete overview of production metrics and performance
                </p>
              </button>

              <button
                onClick={() => downloadReport("efficiency")}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Efficiency Report
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Detailed analysis of production efficiency and optimization
                  opportunities
                </p>
              </button>

              <button
                onClick={() => downloadReport("quality")}
                className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                    <CheckCircle className="text-yellow-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Quality Report
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Quality control metrics and compliance analysis
                </p>
              </button>

              <button
                onClick={() => downloadReport("operator")}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Users className="text-purple-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Operator Performance
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Individual operator performance and productivity analysis
                </p>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-2">Report Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Production:</p>
                <p className="font-semibold">
                  {productionAnalytics.totalOutput}L
                </p>
              </div>
              <div>
                <p className="text-gray-600">Average Efficiency:</p>
                <p className="font-semibold">
                  {productionAnalytics.averageEfficiency}%
                </p>
              </div>
              <div>
                <p className="text-gray-600">Quality Score:</p>
                <p className="font-semibold">
                  {productionAnalytics.averageQuality}%
                </p>
              </div>
              <div>
                <p className="text-gray-600">Active Batches:</p>
                <p className="font-semibold">
                  {productionAnalytics.activeBatches}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-2xl relative p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowReportsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <Download className="text-blue-600" size={24} />
              Download Production Reports
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  downloadReport("summary");
                  setShowReportsModal(false);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BarChart3 className="text-blue-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Production Summary
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Complete overview of production metrics
                </p>
              </button>

              <button
                onClick={() => {
                  downloadReport("efficiency");
                  setShowReportsModal(false);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Efficiency Report
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Production efficiency analysis
                </p>
              </button>

              <button
                onClick={() => {
                  downloadReport("quality");
                  setShowReportsModal(false);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                    <CheckCircle className="text-yellow-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Quality Report
                  </h3>
                </div>
                <p className="text-sm text-gray-600">Quality control metrics</p>
              </button>

              <button
                onClick={() => {
                  downloadReport("operator");
                  setShowReportsModal(false);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Users className="text-purple-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Operator Performance
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Operator performance analysis
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
