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
  Truck,
  MapPin,
  Calendar,
  BarChart3,
  RefreshCw,
  FileText,
  Archive,
  Tag,
  Users,
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
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [expiryFilter, setExpiryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null); // new
  const [isExporting, setIsExporting] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
      .includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.type === selectedCategory;
    const matchesLocation =
      selectedLocation === "All" || item.location?.zone === selectedLocation;
    const matchesSupplier =
      selectedSupplier === "All" || item.supplier?.name === selectedSupplier;
    
    let matchesExpiry = true;
    if (expiryFilter === "Expiring Soon" && item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      matchesExpiry = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    } else if (expiryFilter === "Expired" && item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      matchesExpiry = expiryDate < today;
    }
    
    return matchesSearch && matchesCategory && matchesLocation && matchesSupplier && matchesExpiry;
  });

  // Get unique locations and suppliers for filters
  const uniqueLocations = ["All", ...new Set(inventoryData.map(item => item.location?.zone).filter(Boolean))];
  const uniqueSuppliers = ["All", ...new Set(inventoryData.map(item => item.supplier?.name).filter(Boolean))];

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
  const expiringSoon = inventoryData.filter((item) => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }).length;
  const reorderNeeded = inventoryData.filter(
    (item) => item.currentStock <= (item.reorderPoint || item.minStock)
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{inventoryData.length}</p>
              <p className="text-xs text-gray-500 mt-1">Active SKUs</p>
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
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                +5.2% vs last month
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
              <p className="text-xs text-gray-500 mt-1">Needs attention</p>
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
              <p className="text-xs text-gray-500 mt-1">Urgent reorder</p>
            </div>
            <TrendingDown className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">
                {expiringSoon}
              </p>
              <p className="text-xs text-gray-500 mt-1">Within 30 days</p>
            </div>
            <Calendar className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by name, SKU, or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Search inventory items"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              aria-label="Filter by location"
            >
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location === "All" ? "All Locations" : `Zone ${location}`}
                </option>
              ))}
            </select>

            {/* Supplier Filter */}
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              aria-label="Filter by supplier"
            >
              {uniqueSuppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier === "All" ? "All Suppliers" : supplier}
                </option>
              ))}
            </select>

            {/* Expiry Filter */}
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              aria-label="Filter by expiry"
            >
              <option value="All">All Items</option>
              <option value="Expiring Soon">Expiring Soon (30 days)</option>
              <option value="Expired">Expired</option>
            </select>

            {/* View Mode Toggle */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  viewMode === "grid"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  viewMode === "table"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Table
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Bulk Actions ({selectedItems.length})
              </button>
            )}
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item._id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item._id));
                      }
                    }}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{item.type}</span>
                      {item.sku && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Tag size={12} />
                            SKU: {item.sku}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
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
                  {item.currentStock} {item.unit || "units"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Min / Max Stock:</span>
                <span className="font-medium">
                  {item.minStock} / {item.maxStock || "N/A"} {item.unit || "units"}
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

              {/* Additional Information */}
              {item.location && (
                <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t">
                  <MapPin size={12} />
                  <span>
                    {item.location.zone && `Zone: ${item.location.zone}`}
                    {item.location.rack && `, Rack: ${item.location.rack}`}
                    {item.location.shelf && `, Shelf: ${item.location.shelf}`}
                  </span>
                </div>
              )}

              {item.batchNumber && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Archive size={12} />
                  <span>Batch: {item.batchNumber}</span>
                </div>
              )}

              {item.expiryDate && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar size={12} />
                  <span className={
                    new Date(item.expiryDate) < new Date()
                      ? "text-red-600 font-medium"
                      : Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 30
                      ? "text-orange-600 font-medium"
                      : "text-gray-600"
                  }>
                    Exp: {new Date(item.expiryDate).toLocaleDateString()}
                    {new Date(item.expiryDate) < new Date() && " (Expired)"}
                  </span>
                </div>
              )}

              {item.supplier?.name && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Truck size={12} />
                  <span>Supplier: {item.supplier.name}</span>
                </div>
              )}

              {item.valuationMethod && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <BarChart3 size={12} />
                  <span>Valuation: {item.valuationMethod}</span>
                </div>
              )}

              {item.currentStock <= (item.reorderPoint || item.minStock) && item.currentStock > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                  <p className="text-xs text-yellow-800 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <strong>Reorder Alert:</strong> Stock below reorder point
                  </p>
                  {item.supplier?.contact && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Contact: {item.supplier.contact}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEditClick(item)}
                className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
              >
                Edit Item
              </button>
              <button
                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                title="View History"
              >
                <FileText size={16} />
              </button>
              <button
                className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                title="Refresh Stock"
              >
                <RefreshCw size={16} />
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
