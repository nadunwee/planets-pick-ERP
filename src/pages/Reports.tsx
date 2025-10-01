import { useState } from "react";
import {
  FileText,
  BarChart3,
  TrendingUp,
  Download,
  Eye,
  Printer,
  Search,
  DollarSign,
  Package,
  Users,
  Truck,
  AlertTriangle,
  Shield,
  X,
  Clock,
  CheckCircle,
  Lock,
} from "lucide-react";
import {
  getCurrentUser,
  canDownloadReports,
  canDownloadReportCategory,
  getUserLevelName,
} from "../utils/userAuth";

interface Report {
  id: string;
  name: string;
  description: string;
  category: "sales" | "finance" | "inventory" | "production" | "hr" | "system" | "wastage";
  format: "pdf" | "excel" | "csv";
  lastGenerated: string;
  size: string;
  requiresPermission: string[];
  isAvailable: boolean;
  icon: React.ReactNode;
}

const allReports: Report[] = [
  // Sales Reports
  {
    id: "sales-1",
    name: "Sales Performance Report",
    description: "Monthly sales performance by product, region, and salesperson",
    category: "sales",
    format: "pdf",
    lastGenerated: "2024-01-15 14:30",
    size: "2.4 MB",
    requiresPermission: ["sales", "reports"],
    isAvailable: true,
    icon: <TrendingUp size={20} />,
  },
  {
    id: "sales-2",
    name: "Customer Analysis Report",
    description: "Customer behavior, preferences, and purchase patterns",
    category: "sales",
    format: "excel",
    lastGenerated: "2024-01-14 09:15",
    size: "1.8 MB",
    requiresPermission: ["sales", "reports"],
    isAvailable: true,
    icon: <Users size={20} />,
  },
  {
    id: "sales-3",
    name: "Order Fulfillment Report",
    description: "Order processing times and fulfillment efficiency",
    category: "sales",
    format: "csv",
    lastGenerated: "2024-01-15 16:45",
    size: "0.9 MB",
    requiresPermission: ["sales", "reports"],
    isAvailable: true,
    icon: <Truck size={20} />,
  },

  // Finance Reports
  {
    id: "finance-1",
    name: "Profit & Loss Statement",
    description: "Detailed income, expenses, and net profit analysis",
    category: "finance",
    format: "pdf",
    lastGenerated: "2024-01-15 12:00",
    size: "3.2 MB",
    requiresPermission: ["finance", "reports"],
    isAvailable: true,
    icon: <DollarSign size={20} />,
  },
  {
    id: "finance-2",
    name: "Cash Flow Statement",
    description: "Operating, investing, and financing cash flows",
    category: "finance",
    format: "excel",
    lastGenerated: "2024-01-15 11:30",
    size: "2.1 MB",
    requiresPermission: ["finance", "reports"],
    isAvailable: true,
    icon: <BarChart3 size={20} />,
  },
  {
    id: "finance-3",
    name: "Budget Variance Report",
    description: "Actual vs. budgeted performance analysis",
    category: "finance",
    format: "excel",
    lastGenerated: "2024-01-14 15:20",
    size: "1.6 MB",
    requiresPermission: ["finance", "reports"],
    isAvailable: true,
    icon: <BarChart3 size={20} />,
  },

  // Inventory Reports
  {
    id: "inventory-1",
    name: "Inventory Status Report",
    description: "Current stock levels, reorder points, and stock movements",
    category: "inventory",
    format: "pdf",
    lastGenerated: "2024-01-15 08:00",
    size: "4.1 MB",
    requiresPermission: ["inventory", "reports"],
    isAvailable: true,
    icon: <Package size={20} />,
  },
  {
    id: "inventory-2",
    name: "Stock Turnover Analysis",
    description: "Inventory turnover rates and aging analysis",
    category: "inventory",
    format: "excel",
    lastGenerated: "2024-01-14 13:45",
    size: "2.8 MB",
    requiresPermission: ["inventory", "reports"],
    isAvailable: true,
    icon: <Package size={20} />,
  },

  // Production Reports
  {
    id: "production-1",
    name: "Production Efficiency Report",
    description: "Production output, efficiency metrics, and capacity utilization",
    category: "production",
    format: "pdf",
    lastGenerated: "2024-01-15 10:15",
    size: "3.5 MB",
    requiresPermission: ["production", "reports"],
    isAvailable: true,
    icon: <TrendingUp size={20} />,
  },
  {
    id: "production-2",
    name: "Quality Control Report",
    description: "Quality metrics, defect rates, and improvement areas",
    category: "production",
    format: "excel",
    lastGenerated: "2024-01-14 16:30",
    size: "2.3 MB",
    requiresPermission: ["production", "reports"],
    isAvailable: true,
    icon: <CheckCircle size={20} />,
  },

  // HR Reports
  {
    id: "hr-1",
    name: "Employee Performance Report",
    description: "Individual and team performance metrics",
    category: "hr",
    format: "pdf",
    lastGenerated: "2024-01-15 09:00",
    size: "2.7 MB",
    requiresPermission: ["hr", "reports"],
    isAvailable: true,
    icon: <Users size={20} />,
  },
  {
    id: "hr-2",
    name: "Attendance & Leave Report",
    description: "Employee attendance patterns and leave statistics",
    category: "hr",
    format: "excel",
    lastGenerated: "2024-01-14 14:20",
    size: "1.9 MB",
    requiresPermission: ["hr", "reports"],
    isAvailable: true,
    icon: <Clock size={20} />,
  },

  // System Reports
  {
    id: "system-1",
    name: "System Activity Log",
    description: "User activities, system events, and security logs",
    category: "system",
    format: "csv",
    lastGenerated: "2024-01-15 17:00",
    size: "5.2 MB",
    requiresPermission: ["system", "admin"],
    isAvailable: true,
    icon: <Shield size={20} />,
  },
  {
    id: "system-2",
    name: "Access Control Report",
    description: "User permissions, role assignments, and access patterns",
    category: "system",
    format: "pdf",
    lastGenerated: "2024-01-14 18:15",
    size: "1.4 MB",
    requiresPermission: ["system", "admin"],
    isAvailable: true,
    icon: <Shield size={20} />,
  },

  // Wastage Reports
  {
    id: "wastage-1",
    name: "Wastage Analysis Report",
    description: "Waste tracking, cost analysis, and prevention strategies",
    category: "wastage",
    format: "pdf",
    lastGenerated: "2024-01-15 13:00",
    size: "2.9 MB",
    requiresPermission: ["wastage", "reports"],
    isAvailable: true,
    icon: <AlertTriangle size={20} />,
  },
  {
    id: "wastage-2",
    name: "Waste Prevention Report",
    description: "Prevention measures effectiveness and improvement areas",
    category: "wastage",
    format: "excel",
    lastGenerated: "2024-01-14 12:30",
    size: "1.7 MB",
    requiresPermission: ["wastage", "reports"],
    isAvailable: true,
    icon: <AlertTriangle size={20} />,
  },
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [showReportDetails, setShowReportDetails] = useState<string | null>(null);
  
  // Get current user information from localStorage
  const currentUser = getCurrentUser();
  const userLevel = currentUser?.level || "L1";
  const userDepartment = currentUser?.department || "";

  const categories = ["All", "sales", "finance", "inventory", "production", "hr", "system", "wastage"];
  const formats = ["All", "pdf", "excel", "csv"];

  // All users can VIEW all reports, but download is restricted by level
  const availableReports = allReports;

  const filteredReports = availableReports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || report.category === selectedCategory;
    const matchesFormat = selectedFormat === "All" || report.format === selectedFormat;
    return matchesSearch && matchesCategory && matchesFormat;
  });
  
  // Check if user can download a specific report
  const canUserDownloadReport = (reportCategory: string): boolean => {
    return canDownloadReportCategory(userLevel, userDepartment, reportCategory);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "sales":
        return "text-blue-600 bg-blue-100";
      case "finance":
        return "text-green-600 bg-green-100";
      case "inventory":
        return "text-purple-600 bg-purple-100";
      case "production":
        return "text-orange-600 bg-orange-100";
      case "hr":
        return "text-indigo-600 bg-indigo-100";
      case "system":
        return "text-red-600 bg-red-100";
      case "wastage":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "sales":
        return "Sales";
      case "finance":
        return "Finance";
      case "inventory":
        return "Inventory";
      case "production":
        return "Production";
      case "hr":
        return "HR";
      case "system":
        return "System";
      case "wastage":
        return "Wastage";
      default:
        return category;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText size={16} className="text-red-500" />;
      case "excel":
        return <BarChart3 size={16} className="text-green-500" />;
      case "csv":
        return <FileText size={16} className="text-blue-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const handleDownloadReport = (report: Report) => {
    if (!canUserDownloadReport(report.category)) {
      alert(`Access Denied: ${getUserLevelName(userLevel)} cannot download ${report.category} reports. ${userLevel === "L1" ? "Level 1 users cannot download any reports." : "You can only download reports relevant to your department."}`);
      return;
    }
    console.log(`Downloading ${report.name} in ${report.format} format`);
    // Here you would typically trigger the actual download
    // For now, we'll just show a success message
    alert(`Downloading ${report.name}...`);
  };

  const handlePreviewReport = (report: Report) => {
    console.log(`Previewing ${report.name}`);
    setShowReportDetails(report.id);
  };

  const handlePrintReport = (report: Report) => {
    if (!canUserDownloadReport(report.category)) {
      alert(`Access Denied: ${getUserLevelName(userLevel)} cannot print ${report.category} reports.`);
      return;
    }
    console.log(`Printing ${report.name}`);
    // Here you would typically trigger printing
  };

  const totalReports = availableReports.length;
  const recentReports = availableReports.filter(report => 
    new Date(report.lastGenerated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Access comprehensive reports based on your role and permissions
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {currentUser?.name || "Guest"}
              </span>
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {getUserLevelName(userLevel)}
              </span>
            </div>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-600">
              {userLevel === "L1" && "Can view reports only"}
              {userLevel === "L2" && "Can download department reports"}
              {userLevel === "L3" && "Can download all reports"}
              {userLevel === "L4" && "Full access"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              canDownloadReports(userLevel)
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!canDownloadReports(userLevel)}
            title={!canDownloadReports(userLevel) ? "Your access level does not permit bulk downloads" : ""}
          >
            <Download size={16} />
            Bulk Download
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Reports</p>
              <p className="text-2xl font-bold text-blue-600">{totalReports}</p>
              <p className="text-sm text-blue-600 flex items-center gap-1">
                <FileText size={14} />
                Based on permissions
              </p>
            </div>
            <FileText className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Reports</p>
              <p className="text-2xl font-bold text-green-600">{recentReports}</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Clock size={14} />
                Last 7 days
              </p>
            </div>
            <Clock className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">PDF Reports</p>
              <p className="text-2xl font-bold text-red-600">
                {availableReports.filter(r => r.format === "pdf").length}
              </p>
              <p className="text-sm text-red-600 flex items-center gap-1">
                <FileText size={14} />
                Print ready
              </p>
            </div>
            <FileText className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Excel Reports</p>
              <p className="text-2xl font-bold text-green-600">
                {availableReports.filter(r => r.format === "excel").length}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <BarChart3 size={14} />
                Data analysis
              </p>
            </div>
            <BarChart3 className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <BarChart3 size={20} />
            Available Reports
          </h2>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All Categories" : getCategoryName(category)}
                  </option>
                ))}
              </select>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formats.map((format) => (
                  <option key={format} value={format}>
                    {format === "All" ? "All Formats" : format.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-blue-600">
                    {report.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{report.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(report.category)}`}>
                        {getCategoryName(report.category)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getFormatIcon(report.format)} {report.format.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Last generated: {report.lastGenerated}</span>
                    <span>Size: {report.size}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className={`flex-1 px-3 py-2 rounded text-sm transition flex items-center justify-center gap-1 ${
                      canUserDownloadReport(report.category)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!canUserDownloadReport(report.category)}
                    title={
                      !canUserDownloadReport(report.category)
                        ? userLevel === "L1"
                          ? "Level 1 users cannot download reports"
                          : "You can only download reports for your department"
                        : ""
                    }
                  >
                    {canUserDownloadReport(report.category) ? (
                      <Download size={14} />
                    ) : (
                      <Lock size={14} />
                    )}
                    Download
                  </button>
                  <button
                    onClick={() => handlePreviewReport(report)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
                    title="Preview report"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handlePrintReport(report)}
                    className={`px-3 py-2 rounded text-sm transition ${
                      canUserDownloadReport(report.category)
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!canUserDownloadReport(report.category)}
                    title={
                      !canUserDownloadReport(report.category)
                        ? "Print access restricted"
                        : "Print report"
                    }
                  >
                    <Printer size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {showReportDetails && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Report Details</h2>
              <button
                onClick={() => setShowReportDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {(() => {
              const report = availableReports.find(r => r.id === showReportDetails);
              if (!report) return null;
              
              return (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="text-blue-600 p-3 bg-blue-50 rounded-lg">
                      {report.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{report.name}</h3>
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(report.category)}`}>
                          {getCategoryName(report.category)}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {report.format.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Report Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Generated:</span>
                          <span className="font-medium">{report.lastGenerated}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">File Size:</span>
                          <span className="font-medium">{report.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{getCategoryName(report.category)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span className="font-medium">{report.format.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className={`w-full py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                            canUserDownloadReport(report.category)
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!canUserDownloadReport(report.category)}
                        >
                          {canUserDownloadReport(report.category) ? (
                            <Download size={16} />
                          ) : (
                            <Lock size={16} />
                          )}
                          Download Report
                        </button>
                        <button
                          onClick={() => handlePrintReport(report)}
                          className={`w-full py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                            canUserDownloadReport(report.category)
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!canUserDownloadReport(report.category)}
                        >
                          <Printer size={16} />
                          Print Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
