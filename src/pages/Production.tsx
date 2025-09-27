import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  TrendingUp,
  CheckCircle,
  XCircle,
  Settings,
  Bot,
  BarChart3,
  Zap,
  X,
  FileText,
} from "lucide-react";
import { productionService } from "../components/services/productionService";
import type { ProductionBatch } from "../components/services/productionService";

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
    | "completed";
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
          quality: batchFormData.qualityChecked ? "excellent" : "good",
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
          quality: batchFormData.qualityChecked ? "excellent" : "good",
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
    setBatchFormData({
      date:
        batch.startTime.split(" ")[0] || new Date().toISOString().split("T")[0],
      time:
        batch.startTime.split(" ")[1] ||
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      batchNo: batch.batchNumber,
      batchType: "processing",
      batchItem: batch.productName,
      qty: batch.targetYield,
      qualityChecked: batch.quality === "excellent",
      operatorName: batch.operator,
    });
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
      default:
        return status;
    }
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
            <Play size={16} />
            {showBatchForm ? "Hide Form" : "Start Batch"}
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <FileText size={16} />
            Download Reports
          </button>
        </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Batches</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  productionBatches.filter(
                    (batch) => batch.status === "running"
                  ).length
                }
              </p>
            </div>
            <Play className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Efficiency</p>
              <p className="text-2xl font-bold text-blue-600">89%</p>
            </div>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Daily Output</p>
              <p className="text-2xl font-bold text-purple-600">850 units</p>
            </div>
            <BarChart3 className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quality Score</p>
              <p className="text-2xl font-bold text-yellow-600">94%</p>
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
              <h2 className="font-semibold text-lg">
                Active Production Batches
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {productionBatches.map((batch) => (
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
                      <p className="text-sm font-medium">{batch.operator}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time Remaining</p>
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
                            : batch.processStatus === "machine-3"
                            ? "bg-purple-500"
                            : batch.processStatus === "machine-2"
                            ? "bg-blue-500"
                            : batch.processStatus === "machine-1"
                            ? "bg-indigo-500"
                            : batch.processStatus === "preparing-materials"
                            ? "bg-yellow-500"
                            : batch.processStatus === "washing-materials"
                            ? "bg-orange-500"
                            : batch.processStatus === "getting-raw-materials"
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
              ))}
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
                        <p className="font-medium">{line.lastMaintenance}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Next Maintenance</p>
                        <p className="font-medium">{line.nextMaintenance}</p>
                      </div>
                    </div>
                    {line.currentBatch && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-gray-500">Current Batch</p>
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
                    <h4 className="font-medium text-sm">{metric.parameter}</h4>
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
    </div>
  );
}
