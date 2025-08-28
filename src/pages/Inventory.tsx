import { useState } from "react";
import { Search, Plus, Filter, Package, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  price: number;
  value: number;
  lastUpdated: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

const inventoryData: InventoryItem[] = [
  {
    id: 1,
    name: "Fresh Coconuts",
    category: "Raw Materials",
    currentStock: 450,
    minStock: 500,
    unit: "pieces",
    price: 35,
    value: 15750,
    lastUpdated: "2024-01-15",
    status: "low-stock"
  },
  {
    id: 2,
    name: "Virgin Coconut Oil",
    category: "Finished Products",
    currentStock: 185,
    minStock: 50,
    unit: "L",
    price: 1200,
    value: 222000,
    lastUpdated: "2024-01-15",
    status: "in-stock"
  },
  {
    id: 3,
    name: "Glass Bottles (500ml)",
    category: "Packaging",
    currentStock: 80,
    minStock: 100,
    unit: "pieces",
    price: 45,
    value: 3600,
    lastUpdated: "2024-01-14",
    status: "low-stock"
  },
  {
    id: 4,
    name: "Dried Jackfruit",
    category: "Finished Products",
    currentStock: 55,
    minStock: 20,
    unit: "kg",
    price: 800,
    value: 44000,
    lastUpdated: "2024-01-15",
    status: "in-stock"
  },
  {
    id: 5,
    name: "Labels",
    category: "Packaging",
    currentStock: 150,
    minStock: 200,
    unit: "pieces",
    price: 5,
    value: 750,
    lastUpdated: "2024-01-13",
    status: "low-stock"
  },
  {
    id: 6,
    name: "Jackfruit",
    category: "Raw Materials",
    currentStock: 25,
    minStock: 50,
    unit: "kg",
    price: 120,
    value: 3000,
    lastUpdated: "2024-01-14",
    status: "low-stock"
  }
];

const categories = ["All", "Raw Materials", "Finished Products", "Packaging"];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0);
  const lowStockItems = inventoryData.filter(item => item.status === "low-stock").length;
  const outOfStockItems = inventoryData.filter(item => item.status === "out-of-stock").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock": return "text-green-600 bg-green-100";
      case "low-stock": return "text-yellow-600 bg-yellow-100";
      case "out-of-stock": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-stock": return <TrendingUp size={16} />;
      case "low-stock": return <AlertCircle size={16} />;
      case "out-of-stock": return <TrendingDown size={16} />;
      default: return <Package size={16} />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your stock levels and inventory items</p>
        </div>
        <button 
          onClick={() => alert("Add Item functionality will be implemented")}
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
              <p className="text-2xl font-bold">LKR {totalValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
            </div>
            <AlertCircle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
                {item.status.replace('-', ' ')}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="font-medium">{item.currentStock} {item.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Min Stock:</span>
                <span className="font-medium">{item.minStock} {item.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unit Price:</span>
                <span className="font-medium">LKR {item.price}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-700">Total Value:</span>
                <span className="font-bold text-green-600">LKR {item.value.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Stock Level Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Stock Level</span>
                <span>{Math.round((item.currentStock / (item.minStock * 2)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    item.status === 'out-of-stock' ? 'bg-red-500' :
                    item.status === 'low-stock' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((item.currentStock / (item.minStock * 2)) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                Update Stock
              </button>
              <button className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">
                Edit Item
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No inventory items found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}