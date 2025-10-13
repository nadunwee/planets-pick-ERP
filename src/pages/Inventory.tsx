import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  Search,
  Plus,
  Filter,
  Package,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  RefreshCw,
  CheckSquare,
  Square,
  Trash2,
  BarChart3,
  ArrowUpDown,
} from "lucide-react";
import AddItemModal from "@/components/inventory/AddItemModal";
import api from "@/components/services/api";

const categories = ["All", "Raw Materials", "Finished Products", "Packaging"];
const stockStatusFilters = ["All", "In Stock", "Low Stock", "Out of Stock"];
const sortOptions = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "stock-asc", label: "Stock (Low to High)" },
  { value: "stock-desc", label: "Stock (High to Low)" },
  { value: "value-asc", label: "Value (Low to High)" },
  { value: "value-desc", label: "Value (High to Low)" },
];

type InventoryReportResponse = {
  downloadUrl: string;
  message?: string;
};

export default function Inventory() {
  const navigate = useNavigate();
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null); // new
  const [isExporting, setIsExporting] = useState(false);
  const [stockStatusFilter, setStockStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const [showAnalytics, setShowAnalytics] = useState(false);

  async function fetchInventory() {
    try {
      setLoading(true);
      const { data } = await api.get("/inventory/all_inventory");
      setInventoryData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      const status = err?.response?.status;
      const messageText =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to fetch inventory";
      setError(messageText);
      if (status === 401) {
        message.error("Session expired. Please log in again.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory(); // call once on mount
  }, []);

  const filteredItems = inventoryData
    .filter((item) => {
      const matchesSearch = item.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.type === selectedCategory;
      
      // Stock status filter
      let matchesStockStatus = true;
      if (stockStatusFilter === "In Stock") {
        matchesStockStatus = item.currentStock > item.minStock;
      } else if (stockStatusFilter === "Low Stock") {
        matchesStockStatus = item.currentStock <= item.minStock && item.currentStock > 0;
      } else if (stockStatusFilter === "Out of Stock") {
        matchesStockStatus = item.currentStock === 0;
      }

      // Value filter
      const itemValue = item.currentStock * (item.price || item.unitPrice || 0);
      const matchesMinValue = minValue === "" || itemValue >= parseFloat(minValue);
      const matchesMaxValue = maxValue === "" || itemValue <= parseFloat(maxValue);

      return matchesSearch && matchesCategory && matchesStockStatus && matchesMinValue && matchesMaxValue;
    })
    .sort((a, b) => {
      const [field, order] = sortBy.split("-");
      let comparison = 0;

      switch (field) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "stock":
          comparison = a.currentStock - b.currentStock;
          break;
        case "value":
          const valueA = a.currentStock * (a.price || a.unitPrice || 0);
          const valueB = b.currentStock * (b.price || b.unitPrice || 0);
          comparison = valueA - valueB;
          break;
        default:
          comparison = 0;
      }

      return order === "asc" ? comparison : -comparison;
    });

  const totalValue = inventoryData.reduce(
    (sum, item) =>
      sum + item.currentStock * (item.price || item.unitPrice || 0),
    0
  );
  const lowStockItems = inventoryData.filter(
    (item) => item.currentStock <= item.minStock && item.currentStock > 0
  ).length;
  const outOfStockItems = inventoryData.filter(
    (item) => item.currentStock === 0
  ).length;

  const getStatusColor = (item: any) => {
    if (item.currentStock === 0) return "text-red-600 bg-red-100";
    if (item.currentStock <= item.minStock)
      return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getStatusIcon = (item: any) => {
    if (item.currentStock === 0) return <TrendingDown size={16} />;
    if (item.currentStock <= item.minStock) return <AlertCircle size={16} />;
    return <TrendingUp size={16} />;
  };

  if (loading) return <p className="p-4">Loading inventory...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  // handle add or edit
  async function handleSaveItem(payload: any) {
    try {
      if (!editingItem) {
        await api.post("/inventory/add_inventory", payload);
      } else {
        await api.put(`/inventory/edit_inventory/${editingItem._id}`, payload);
      }

      setIsModalOpen(false);
      setEditingItem(null);
      message.success("Inventory item saved successfully");
      await fetchInventory();
    } catch (err: any) {
      console.error(err);
      const status = err?.response?.status;
      const messageText =
        err?.response?.data?.error || err?.message || "Failed to save item";
      message.error(messageText);
      if (status === 401) {
        navigate("/login");
      }
    }
  }

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const exportInventoryReport = async () => {
    try {
      setIsExporting(true);
      const { data: result } = await api.post<InventoryReportResponse>(
        "/reports/generate/inventory-report"
      );

      if (!result?.downloadUrl) {
        throw new Error("Report download link not provided");
      }

      // Create a temporary link to trigger the download
      const a = document.createElement("a");
      a.href = `http://localhost:4000${result.downloadUrl}`;
      a.download = "inventory-report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      message.success("Inventory report exported successfully");
    } catch (err: any) {
      console.error(err);
      const status = err?.response?.status;
      const messageText =
        err?.response?.data?.error || err?.message || "Failed to export report";
      message.error(messageText);
      if (status === 401) {
        navigate("/login");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item._id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.size} items?`)) return;
    
    try {
      // Note: Implement bulk delete API endpoint on backend if needed
      message.info("Bulk delete functionality requires backend support");
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } catch (err: any) {
      message.error("Failed to delete items");
    }
  };

  const calculateCategoryStats = () => {
    const stats: Record<string, { count: number; value: number }> = {};
    inventoryData.forEach((item) => {
      const category = item.type || "Unknown";
      if (!stats[category]) {
        stats[category] = { count: 0, value: 0 };
      }
      stats[category].count++;
      stats[category].value += item.currentStock * (item.price || item.unitPrice || 0);
    });
    return stats;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Manage your stock levels and inventory items
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportInventoryReport}
            disabled={isExporting}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} />
                Export Report
              </>
            )}
          </button>
          <button
            onClick={() => message.info("Import functionality requires backend support")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Upload size={16} />
            Import CSV
          </button>
          <button
            onClick={fetchInventory}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition w-fit"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{inventoryData.length}</p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">
                LKR {totalValue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {lowStockItems}
              </p>
            </div>
            <AlertCircle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {outOfStockItems}
              </p>
            </div>
            <TrendingDown className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Search inventory items"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-500" />
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Filter by stock status"
            >
              {stockStatusFilters.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Sort by"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Min Value (LKR)</label>
            <input
              type="number"
              placeholder="0"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Max Value (LKR)</label>
            <input
              type="number"
              placeholder="No limit"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2"
            >
              {selectedItems.size === filteredItems.length ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              Select All
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition flex items-center gap-2"
            >
              <BarChart3 size={16} />
              {showAnalytics ? "Hide" : "Show"} Analytics
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredItems.length} of {inventoryData.length} items
          {selectedItems.size > 0 && ` (${selectedItems.size} selected)`}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
          <span className="text-blue-700 font-medium">
            {selectedItems.size} items selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
            <button
              onClick={() => {
                setSelectedItems(new Set());
                setShowBulkActions(false);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Inventory Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(calculateCategoryStats()).map(([category, stats]) => (
              <div key={category} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{category}</h4>
                <p className="text-sm text-gray-600">Items: {stats.count}</p>
                <p className="text-sm text-gray-600">
                  Total Value: LKR {stats.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className={`bg-white p-4 rounded-lg shadow border hover:shadow-lg transition ${
              selectedItems.has(item._id) ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start gap-2 flex-1">
                <button
                  onClick={() => toggleItemSelection(item._id)}
                  className="mt-1 text-gray-400 hover:text-blue-600 transition"
                >
                  {selectedItems.has(item._id) ? (
                    <CheckSquare size={20} className="text-blue-600" />
                  ) : (
                    <Square size={20} />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600">{item.type}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                  item
                )}`}
              >
                {getStatusIcon(item)}
                {item.currentStock === 0
                  ? "Out of stock"
                  : item.currentStock <= item.minStock
                  ? "Low stock"
                  : "In stock"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="font-medium">
                  {item.currentStock} {item.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Min Stock:</span>
                <span className="font-medium">
                  {item.minStock} {item.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unit Price:</span>
                <span className="font-medium">
                  LKR {item.price || item.unitPrice}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-700">
                  Total Value:
                </span>
                <span className="font-bold text-green-600">
                  LKR{" "}
                  {(
                    item.currentStock * (item.price || item.unitPrice || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEditClick(item)}
                className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center justify-center gap-1"
              >
                <RefreshCw size={14} />
                Edit Item
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            No inventory items found matching your criteria.
          </p>
        </div>
      )}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItem}
        initialData={editingItem} // pass current values
      />
    </div>
  );
}
