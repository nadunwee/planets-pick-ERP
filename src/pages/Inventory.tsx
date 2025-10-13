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
} from "lucide-react";
import AddItemModal from "@/components/inventory/AddItemModal";
import api from "@/components/services/api";

const categories = ["All", "Raw Materials", "Finished Products", "Packaging"];

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

  const filteredItems = inventoryData.filter((item) => {
    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
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
        <div className="flex gap-2">
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
      <div className="bg-white p-4 rounded-lg shadow border">
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
        </div>
      </div>

      {/* Inventory Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">{item.type}</p>
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
              {/* <button
                onClick={() => alert(`Update stock for ${item.name}`)}
                className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
              >
                Update Stock
              </button> */}
              <button
                onClick={() => handleEditClick(item)}
                className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
              >
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
