import { useState } from "react";
import {
  Trash2,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  X,
} from "lucide-react";

interface WastageItem {
  id: string;
  date: string;
  category: "raw_material" | "finished_goods" | "packaging" | "production_waste" | "expired_goods";
  description: string;
  quantity: number;
  unit: string;
  cost: number;
  reason: string;
  department: string;
  reportedBy: string;
  status: "pending" | "investigated" | "resolved" | "prevented";
  preventionMeasures?: string;
}

interface WastageCategory {
  name: string;
  totalQuantity: number;
  totalCost: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  color: string;
}

const wastageItems: WastageItem[] = [
  {
    id: "1",
    date: "2024-01-15",
    category: "raw_material",
    description: "Coconut meat spoilage due to improper storage",
    quantity: 150,
    unit: "kg",
    cost: 45000,
    reason: "Temperature control failure",
    department: "Storage",
    reportedBy: "John Smith",
    status: "resolved",
    preventionMeasures: "Installed new temperature monitoring system",
  },
  {
    id: "2",
    date: "2024-01-14",
    category: "finished_goods",
    description: "Expired coconut oil products",
    quantity: 50,
    unit: "bottles",
    cost: 25000,
    reason: "Overproduction and slow sales",
    department: "Sales",
    reportedBy: "Sarah Johnson",
    status: "investigated",
  },
  {
    id: "3",
    date: "2024-01-13",
    category: "packaging",
    description: "Damaged glass bottles during transport",
    quantity: 200,
    unit: "bottles",
    cost: 30000,
    reason: "Poor packaging protection",
    department: "Logistics",
    reportedBy: "Mike Chen",
    status: "resolved",
    preventionMeasures: "Improved packaging materials and handling procedures",
  },
  {
    id: "4",
    date: "2024-01-12",
    category: "production_waste",
    description: "Coconut shell waste from processing",
    quantity: 300,
    unit: "kg",
    cost: 15000,
    reason: "Processing inefficiency",
    department: "Production",
    reportedBy: "Lisa Wang",
    status: "pending",
  },
  {
    id: "5",
    date: "2024-01-11",
    category: "expired_goods",
    description: "Expired coconut milk products",
    quantity: 75,
    unit: "cartons",
    cost: 37500,
    reason: "Short shelf life and inventory management issues",
    department: "Inventory",
    reportedBy: "David Brown",
    status: "resolved",
    preventionMeasures: "Implemented FIFO system and better demand forecasting",
  },
];

const wastageCategories: WastageCategory[] = [
  {
    name: "Raw Materials",
    totalQuantity: 450,
    totalCost: 120000,
    percentage: 35,
    trend: "down",
    color: "text-blue-600",
  },
  {
    name: "Finished Goods",
    totalQuantity: 125,
    totalCost: 62500,
    percentage: 18,
    trend: "up",
    color: "text-green-600",
  },
  {
    name: "Packaging",
    totalQuantity: 400,
    totalCost: 60000,
    percentage: 17,
    trend: "stable",
    color: "text-purple-600",
  },
  {
    name: "Production Waste",
    totalQuantity: 600,
    totalCost: 30000,
    percentage: 9,
    trend: "down",
    color: "text-orange-600",
  },
  {
    name: "Expired Goods",
    totalQuantity: 150,
    totalCost: 75000,
    percentage: 21,
    trend: "down",
    color: "text-red-600",
  },
];

export default function Wastage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [showAddWastage, setShowAddWastage] = useState(false);
  const [showWastageDetails, setShowWastageDetails] = useState<string | null>(null);

  const categories = ["All", "raw_material", "finished_goods", "packaging", "production_waste", "expired_goods"];
  const statuses = ["All", "pending", "investigated", "resolved", "prevented"];
  const departments = ["All", "Storage", "Sales", "Logistics", "Production", "Inventory"];

  const filteredWastage = wastageItems.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
    const matchesDepartment = selectedDepartment === "All" || item.department === selectedDepartment;
    return matchesSearch && matchesCategory && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "investigated":
        return "text-blue-600 bg-blue-100";
      case "resolved":
        return "text-green-600 bg-green-100";
      case "prevented":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "raw_material":
        return "text-blue-600 bg-blue-100";
      case "finished_goods":
        return "text-green-600 bg-green-100";
      case "packaging":
        return "text-purple-600 bg-purple-100";
      case "production_waste":
        return "text-orange-600 bg-orange-100";
      case "expired_goods":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "raw_material":
        return "Raw Material";
      case "finished_goods":
        return "Finished Goods";
      case "packaging":
        return "Packaging";
      case "production_waste":
        return "Production Waste";
      case "expired_goods":
        return "Expired Goods";
      default:
        return category;
    }
  };

  const totalWastageCost = wastageItems.reduce((sum, item) => sum + item.cost, 0);
  const totalWastageQuantity = wastageItems.reduce((sum, item) => sum + item.quantity, 0);
  const resolvedItems = wastageItems.filter(item => item.status === "resolved").length;
  const pendingItems = wastageItems.filter(item => item.status === "pending").length;

  // Export Wastage Analysis Report
  const exportWastageReport = () => {
    // Calculate wastage analytics
    const categoryBreakdown: Record<string, { quantity: number; cost: number; count: number }> = {};
    filteredWastage.forEach(item => {
      const cat = getCategoryName(item.category);
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { quantity: 0, cost: 0, count: 0 };
      }
      categoryBreakdown[cat].quantity += item.quantity;
      categoryBreakdown[cat].cost += item.cost;
      categoryBreakdown[cat].count += 1;
    });

    const departmentBreakdown: Record<string, { cost: number; count: number }> = {};
    filteredWastage.forEach(item => {
      if (!departmentBreakdown[item.department]) {
        departmentBreakdown[item.department] = { cost: 0, count: 0 };
      }
      departmentBreakdown[item.department].cost += item.cost;
      departmentBreakdown[item.department].count += 1;
    });

    const totalCost = filteredWastage.reduce((sum, item) => sum + item.cost, 0);
    const totalItems = filteredWastage.length;
    const averageCostPerIncident = totalItems > 0 ? totalCost / totalItems : 0;

    // Create CSV content
    let csvContent = "PLANETS PICK ERP - WASTAGE ANALYSIS REPORT\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Analysis Period: All Records\n\n`;
    
    csvContent += "WASTAGE SUMMARY\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Wastage Incidents,${totalItems}\n`;
    csvContent += `Total Wastage Cost,LKR ${totalCost.toLocaleString()}\n`;
    csvContent += `Average Cost per Incident,LKR ${averageCostPerIncident.toLocaleString()}\n`;
    csvContent += `Resolved Incidents,${filteredWastage.filter(i => i.status === 'resolved').length}\n`;
    csvContent += `Pending Incidents,${filteredWastage.filter(i => i.status === 'pending').length}\n`;
    csvContent += `Prevented Recurrences,${filteredWastage.filter(i => i.status === 'prevented').length}\n\n`;
    
    csvContent += "CATEGORY BREAKDOWN\n";
    csvContent += "Category,Incidents,Quantity,Total Cost,Avg Cost\n";
    Object.entries(categoryBreakdown).forEach(([category, data]) => {
      const avgCost = data.count > 0 ? data.cost / data.count : 0;
      csvContent += `"${category}",${data.count},${data.quantity},${data.cost.toLocaleString()},${avgCost.toLocaleString()}\n`;
    });
    
    csvContent += "\nDEPARTMENT BREAKDOWN\n";
    csvContent += "Department,Incidents,Total Cost,Avg Cost per Incident\n";
    Object.entries(departmentBreakdown).forEach(([dept, data]) => {
      const avgCost = data.count > 0 ? data.cost / data.count : 0;
      csvContent += `"${dept}",${data.count},${data.cost.toLocaleString()},${avgCost.toLocaleString()}\n`;
    });
    
    csvContent += "\nWASTAGE INCIDENT DETAILS\n";
    csvContent += "Date,Category,Description,Quantity,Unit,Cost,Reason,Department,Reported By,Status,Prevention Measures\n";
    filteredWastage.forEach(item => {
      const prevention = item.preventionMeasures || 'N/A';
      csvContent += `${item.date},"${getCategoryName(item.category)}","${item.description}",${item.quantity},${item.unit},${item.cost},"${item.reason}","${item.department}","${item.reportedBy}",${item.status},"${prevention}"\n`;
    });
    
    csvContent += "\nPREVENTION MEASURES IMPLEMENTED\n";
    csvContent += "Category,Description,Prevention Measures\n";
    filteredWastage.filter(i => i.preventionMeasures).forEach(item => {
      csvContent += `"${getCategoryName(item.category)}","${item.description}","${item.preventionMeasures}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Wastage_Analysis_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Wastage analysis report exported successfully!');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Wastage Management
          </h1>
          <p className="text-gray-600">
            Track, analyze, and prevent waste across all operations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddWastage(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
          >
            <Plus size={16} />
            Report Wastage
          </button>
          <button 
            onClick={exportWastageReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Download size={16} />
            Export Report
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
            <TrendingDown size={16} />
            Waste Analysis
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Wastage Cost</p>
              <p className="text-2xl font-bold text-red-600">
                LKR {totalWastageCost.toLocaleString()}
              </p>
              <p className="text-sm text-red-600 flex items-center gap-1">
                <TrendingUp size={14} />
                This month
              </p>
            </div>
            <DollarSign className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-orange-600">
                {totalWastageQuantity.toLocaleString()}
              </p>
              <p className="text-sm text-orange-600 flex items-center gap-1">
                <Package size={14} />
                Units wasted
              </p>
            </div>
            <Package className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved Cases</p>
              <p className="text-2xl font-bold text-green-600">
                {resolvedItems}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle size={14} />
                Issues fixed
              </p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Cases</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingItems}
              </p>
              <p className="text-sm text-yellow-600 flex items-center gap-1">
                <AlertTriangle size={14} />
                Require attention
              </p>
            </div>
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wastage Categories Analysis */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 size={20} />
                Wastage by Category
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {wastageCategories.map((category, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${category.color.replace('text-', 'bg-')}`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600">
                          {category.totalQuantity} units • LKR {category.totalCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{category.percentage}%</p>
                      <div className="flex items-center gap-1 text-sm">
                        {category.trend === "up" ? (
                          <TrendingUp size={14} className="text-red-500" />
                        ) : category.trend === "down" ? (
                          <TrendingDown size={14} className="text-green-500" />
                        ) : (
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        )}
                        <span className={category.trend === "up" ? "text-red-500" : category.trend === "down" ? "text-green-500" : "text-gray-500"}>
                          {category.trend === "up" ? "Increasing" : category.trend === "down" ? "Decreasing" : "Stable"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wastage Items */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Trash2 size={20} />
                Recent Wastage Reports
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
                      placeholder="Search wastage reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "All" ? "All Categories" : getCategoryName(category)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status === "All" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {filteredWastage.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setShowWastageDetails(item.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{item.description}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                            {getCategoryName(item.category)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Quantity: {item.quantity} {item.unit} • Cost: LKR {item.cost.toLocaleString()}</p>
                          <p>Reason: {item.reason} • Department: {item.department}</p>
                          <p className="flex items-center gap-2">
                            <Calendar size={12} />
                            {item.date} • Reported by {item.reportedBy}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition">
                          <Eye size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition">
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => setShowAddWastage(true)}
                className="w-full bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 transition text-sm"
              >
                Report New Wastage
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-sm">
                Generate Waste Report
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition text-sm">
                Prevention Strategies
              </button>
              <button className="w-full bg-yellow-600 text-white py-2 px-3 rounded hover:bg-yellow-700 transition text-sm">
                Cost Analysis
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 transition text-sm">
                Department Review
              </button>
            </div>
          </div>

          {/* Waste Prevention Tips */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="p-4 border-b border-green-200">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <TrendingDown className="text-green-600" size={20} />
                Prevention Tips
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">Storage Optimization</h4>
                <p className="text-xs text-gray-600">
                  Implement FIFO system and proper temperature controls
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">Production Planning</h4>
                <p className="text-xs text-gray-600">
                  Better demand forecasting to reduce overproduction
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-1">Quality Control</h4>
                <p className="text-xs text-gray-600">
                  Regular inspections and quality checks
                </p>
              </div>
            </div>
          </div>

          {/* Recent Trends */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Recent Trends</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Raw Material Waste</span>
                <span className="text-sm font-medium text-green-600">↓ 15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Finished Goods</span>
                <span className="text-sm font-medium text-red-600">↑ 8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Packaging Waste</span>
                <span className="text-sm font-medium text-blue-600">→ 0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Wastage Modal */}
      {showAddWastage && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Report New Wastage</h2>
              <button
                onClick={() => setShowAddWastage(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="text-center text-gray-500 py-8">
              <Trash2 size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Wastage reporting form will be implemented here</p>
            </div>
          </div>
        </div>
      )}

      {/* Wastage Details Modal */}
      {showWastageDetails && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Wastage Details</h2>
              <button
                onClick={() => setShowWastageDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="text-center text-gray-500 py-8">
              <Eye size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Detailed wastage information will be displayed here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add missing icon component
function CheckCircle({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
