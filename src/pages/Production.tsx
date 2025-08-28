import { useState } from "react";
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
} from "lucide-react";

interface ProductionBatch {
  id: string;
  productName: string;
  batchNumber: string;
  status: "running" | "paused" | "completed" | "failed";
  progress: number;
  estimatedTime: string;
  actualTime?: string;
  operator: string;
  startTime: string;
  endTime?: string;
  yield: number;
  targetYield: number;
  quality: "excellent" | "good" | "fair" | "poor";
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

const productionBatches: ProductionBatch[] = [
  {
    id: "1",
    productName: "Virgin Coconut Oil",
    batchNumber: "VCO-2024-045",
    status: "running",
    progress: 75,
    estimatedTime: "45 min",
    operator: "Priya Silva",
    startTime: "08:30 AM",
    yield: 185,
    targetYield: 200,
    quality: "good",
  },
  {
    id: "2",
    productName: "Dried Jackfruit",
    batchNumber: "DJF-2024-023",
    status: "completed",
    progress: 100,
    estimatedTime: "2 hours",
    actualTime: "1h 45m",
    operator: "Kasun Perera",
    startTime: "06:00 AM",
    endTime: "07:45 AM",
    yield: 55,
    targetYield: 50,
    quality: "excellent",
  },
  {
    id: "3",
    productName: "Coconut Flour",
    batchNumber: "CF-2024-012",
    status: "paused",
    progress: 45,
    estimatedTime: "1 hour",
    operator: "Nimal Fernando",
    startTime: "09:00 AM",
    yield: 0,
    targetYield: 75,
    quality: "good",
  },
];

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
  { parameter: "Moisture Content", value: 2.1, unit: "%", target: 2.0, status: "good" },
  { parameter: "Free Fatty Acid", value: 0.05, unit: "%", target: 0.1, status: "excellent" },
  { parameter: "Peroxide Value", value: 0.8, unit: "meq/kg", target: 1.0, status: "excellent" },
  { parameter: "Color", value: 8.2, unit: "Lovibond", target: 8.0, status: "warning" },
];

export default function Production() {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Management</h1>
          <p className="text-gray-600">Monitor and control production processes</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
            <Play size={16} />
            Start Batch
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Bot size={16} />
            AI Optimize
          </button>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Batches</p>
              <p className="text-2xl font-bold text-green-600">2</p>
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
              <h2 className="font-semibold text-lg">Active Production Batches</h2>
            </div>
            <div className="p-4 space-y-4">
              {productionBatches.map((batch) => (
                <div
                  key={batch.id}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedBatch === batch.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedBatch(batch.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{batch.productName}</h3>
                      <p className="text-sm text-gray-500">{batch.batchNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(batch.status)}
                      <span className="text-sm capitalize font-medium">{batch.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Operator</p>
                      <p className="text-sm font-medium">{batch.operator}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time Remaining</p>
                      <p className="text-sm font-medium">{batch.estimatedTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Yield</p>
                      <p className="text-sm font-medium">
                        {batch.yield}/{batch.targetYield} L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Quality</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getQualityColor(batch.quality)}`}>
                        {batch.quality}
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
                          batch.status === "completed"
                            ? "bg-green-500"
                            : batch.status === "running"
                            ? "bg-blue-500"
                            : batch.status === "paused"
                            ? "bg-yellow-500"
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
                      <button className="bg-yellow-600 text-white py-1 px-3 rounded text-sm hover:bg-yellow-700 transition">
                        Pause
                      </button>
                    )}
                    {batch.status === "paused" && (
                      <button className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition">
                        Resume
                      </button>
                    )}
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
                        <p className="text-sm font-medium">{line.currentBatch}</p>
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
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="p-4 border-b border-purple-200">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Bot className="text-purple-600" size={20} />
                AI Production Assistant
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">Optimization Suggestion</h4>
                <p className="text-xs text-gray-600">
                  Increase VCO extraction temperature by 2°C to improve yield by 8%
                </p>
                <button className="mt-2 text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition">
                  Apply
                </button>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">Predictive Maintenance</h4>
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
          </div>

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
                    <span className={`px-2 py-1 rounded-full text-xs ${getQualityColor(metric.status)}`}>
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
                      style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
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
              <button className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-sm">
                Generate Report
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 transition text-sm">
                Schedule Maintenance
              </button>
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