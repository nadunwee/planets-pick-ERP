import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  Package,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import AddItemModal from "@/components/inventory/AddItemModal";

const categories = ["All", "Raw Materials", "Finished Products", "Packaging"];

export default function Inventory() {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null); // new

  async function fetchInventory() {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:4000/api/inventory/all_inventory"
      );
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      setInventoryData(data);
    } catch (err: any) {
      setError(err.message);
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
      let url = "http://localhost:4000/api/inventory/add_inventory";
      let method = "POST";

      if (editingItem) {
        url = `http://localhost:4000/api/inventory/edit_inventory/${editingItem._id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save item");

      setIsModalOpen(false);
      setEditingItem(null);
      await fetchInventory();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  }

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition w-fit"
        >
          <Plus size={16} />
          Add Item
        </button>
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
