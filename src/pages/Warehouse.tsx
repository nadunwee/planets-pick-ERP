import { useState } from "react";
import {
  Package,
  Search,
  Plus,
  Filter,
  MapPin,
  Truck,
  ArrowUpDown,
  AlertTriangle,
  BarChart3,
  Warehouse as WarehouseIcon,
  Box,
  Palette,
  Thermometer,
  Eye,
  Edit,
  Move,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";

interface WarehouseItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  location: string;
  zone: string;
  rack: string;
  shelf: string;
  unit: string;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
  expiryDate?: string;
  temperature?: string;
  humidity?: string;
  status: "in-stock" | "low-stock" | "out-of-stock" | "expired";
  condition: "excellent" | "good" | "fair" | "poor";
  notes?: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "transfer" | "adjustment";
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  date: string;
  operator: string;
  reference?: string;
}

interface WarehouseZone {
  id: string;
  name: string;
  capacity: number;
  usedCapacity: number;
  temperature: string;
  humidity: string;
  items: number;
  status: "active" | "maintenance" | "full";
}

const warehouseItems: WarehouseItem[] = [
  {
    id: "1",
    name: "Organic Tomatoes",
    sku: "TOM-ORG-001",
    category: "Vegetables",
    quantity: 1500,
    minStock: 500,
    maxStock: 2000,
    location: "A-01-01",
    zone: "Cold Storage A",
    rack: "A1",
    shelf: "01",
    unit: "kg",
    unitPrice: 120,
    supplier: "Green Valley Farms",
    lastUpdated: "2024-01-15 14:30",
    expiryDate: "2024-02-15",
    temperature: "4°C",
    humidity: "85%",
    status: "in-stock",
    condition: "excellent",
  },
  {
    id: "2",
    name: "Fresh Carrots",
    sku: "CAR-FRS-002",
    category: "Vegetables",
    quantity: 800,
    minStock: 300,
    maxStock: 1500,
    location: "A-01-02",
    zone: "Cold Storage A",
    rack: "A1",
    shelf: "02",
    unit: "kg",
    unitPrice: 80,
    supplier: "Fresh Harvest Co.",
    lastUpdated: "2024-01-15 16:45",
    expiryDate: "2024-02-10",
    temperature: "4°C",
    humidity: "85%",
    status: "in-stock",
    condition: "good",
  },
  {
    id: "3",
    name: "Organic Spinach",
    sku: "SPN-ORG-003",
    category: "Leafy Greens",
    quantity: 200,
    minStock: 100,
    maxStock: 500,
    location: "B-02-01",
    zone: "Cold Storage B",
    rack: "B2",
    shelf: "01",
    unit: "kg",
    unitPrice: 200,
    supplier: "Organic Valley",
    lastUpdated: "2024-01-15 12:15",
    expiryDate: "2024-01-25",
    temperature: "2°C",
    humidity: "90%",
    status: "low-stock",
    condition: "excellent",
  },
  {
    id: "4",
    name: "Fresh Bell Peppers",
    sku: "PEP-FRS-004",
    category: "Vegetables",
    quantity: 0,
    minStock: 200,
    maxStock: 800,
    location: "A-01-03",
    zone: "Cold Storage A",
    rack: "A1",
    shelf: "03",
    unit: "kg",
    unitPrice: 150,
    supplier: "Pepper Paradise",
    lastUpdated: "2024-01-15 18:20",
    status: "out-of-stock",
    condition: "good",
  },
  {
    id: "5",
    name: "Organic Cucumbers",
    sku: "CUC-ORG-005",
    category: "Vegetables",
    quantity: 1200,
    minStock: 400,
    maxStock: 1800,
    location: "A-01-04",
    zone: "Cold Storage A",
    rack: "A1",
    shelf: "04",
    unit: "kg",
    unitPrice: 100,
    supplier: "Cucumber Co.",
    lastUpdated: "2024-01-15 15:10",
    expiryDate: "2024-02-20",
    temperature: "4°C",
    humidity: "85%",
    status: "in-stock",
    condition: "excellent",
  },
];

const stockMovements: StockMovement[] = [
  {
    id: "1",
    itemId: "1",
    itemName: "Organic Tomatoes",
    type: "in",
    quantity: 500,
    toLocation: "A-01-01",
    reason: "New shipment received",
    date: "2024-01-15 14:30",
    operator: "John Silva",
    reference: "PO-2024-001",
  },
  {
    id: "2",
    itemId: "3",
    itemName: "Organic Spinach",
    type: "out",
    quantity: 50,
    fromLocation: "B-02-01",
    reason: "Production order",
    date: "2024-01-15 16:00",
    operator: "Maria Perera",
    reference: "WO-2024-015",
  },
  {
    id: "3",
    itemId: "4",
    itemName: "Fresh Bell Peppers",
    type: "out",
    quantity: 200,
    fromLocation: "A-01-03",
    reason: "Production order",
    date: "2024-01-15 18:20",
    operator: "Kasun Fernando",
    reference: "WO-2024-016",
  },
  {
    id: "4",
    itemId: "2",
    itemName: "Fresh Carrots",
    type: "transfer",
    quantity: 100,
    fromLocation: "A-01-02",
    toLocation: "A-01-05",
    reason: "Reorganization",
    date: "2024-01-15 16:45",
    operator: "Amara Jayawardene",
  },
];

const warehouseZones: WarehouseZone[] = [
  {
    id: "1",
    name: "Cold Storage A",
    capacity: 5000,
    usedCapacity: 3500,
    temperature: "4°C",
    humidity: "85%",
    items: 4,
    status: "active",
  },
  {
    id: "2",
    name: "Cold Storage B",
    capacity: 3000,
    usedCapacity: 200,
    temperature: "2°C",
    humidity: "90%",
    items: 1,
    status: "active",
  },
  {
    id: "3",
    name: "Dry Storage A",
    capacity: 8000,
    usedCapacity: 6000,
    temperature: "18°C",
    humidity: "60%",
    items: 12,
    status: "active",
  },
  {
    id: "4",
    name: "Frozen Storage",
    capacity: 2000,
    usedCapacity: 1800,
    temperature: "-18°C",
    humidity: "95%",
    items: 8,
    status: "maintenance",
  },
];

export default function Warehouse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [activeTab, setActiveTab] = useState<"inventory" | "movements" | "zones" | "analytics">("inventory");
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showStockMovementModal, setShowStockMovementModal] = useState(false);
  const [showLowStockAlerts, setShowLowStockAlerts] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    sku: "",
    category: "Vegetables",
    quantity: "",
    minStock: "",
    maxStock: "",
    location: "",
    zone: "Cold Storage A",
    rack: "",
    shelf: "",
    unit: "kg",
    unitPrice: "",
    supplier: "",
    expiryDate: "",
    temperature: "",
    humidity: "",
    notes: ""
  });
  const [stockMovement, setStockMovement] = useState({
    itemId: "",
    type: "in" as "in" | "out" | "transfer" | "adjustment",
    quantity: "",
    fromLocation: "",
    toLocation: "",
    reason: "",
    reference: ""
  });

  const categories = ["All", "Vegetables", "Leafy Greens", "Fruits", "Herbs", "Root Vegetables"];
  const zones = ["All", "Cold Storage A", "Cold Storage B", "Dry Storage A", "Frozen Storage"];
  const statuses = ["All", "in-stock", "low-stock", "out-of-stock", "expired"];

  const filteredItems = warehouseItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesZone = selectedZone === "All" || item.zone === selectedZone;
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesZone && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "text-green-600 bg-green-100";
      case "low-stock":
        return "text-yellow-600 bg-yellow-100";
      case "out-of-stock":
        return "text-red-600 bg-red-100";
      case "expired":
        return "text-red-800 bg-red-200";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "fair":
        return "text-yellow-600 bg-yellow-100";
      case "poor":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const totalItems = warehouseItems.length;
  const totalQuantity = warehouseItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = warehouseItems.filter(item => item.status === "low-stock").length;
  const totalValue = warehouseItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Get low stock alerts
  const lowStockAlerts = warehouseItems.filter(item => 
    item.quantity <= item.minStock || item.status === "low-stock"
  );

  const handleAddItem = () => {
    const newItemData: WarehouseItem = {
      id: String(warehouseItems.length + 1),
      name: newItem.name,
      sku: newItem.sku,
      category: newItem.category,
      quantity: parseInt(newItem.quantity),
      minStock: parseInt(newItem.minStock),
      maxStock: parseInt(newItem.maxStock),
      location: newItem.location,
      zone: newItem.zone,
      rack: newItem.rack,
      shelf: newItem.shelf,
      unit: newItem.unit,
      unitPrice: parseFloat(newItem.unitPrice),
      supplier: newItem.supplier,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      expiryDate: newItem.expiryDate || undefined,
      temperature: newItem.temperature || undefined,
      humidity: newItem.humidity || undefined,
      status: parseInt(newItem.quantity) <= parseInt(newItem.minStock) ? "low-stock" : "in-stock",
      condition: "excellent",
      notes: newItem.notes || undefined
    };

    // In a real app, you'd add this to state
    console.log("New item added:", newItemData);
    alert("Item added successfully! In production, this would update the database.");
    setShowAddItemModal(false);
    setNewItem({
      name: "", sku: "", category: "Vegetables", quantity: "", minStock: "", maxStock: "",
      location: "", zone: "Cold Storage A", rack: "", shelf: "", unit: "kg", unitPrice: "",
      supplier: "", expiryDate: "", temperature: "", humidity: "", notes: ""
    });
  };

  const handleStockMovement = () => {
    const selectedItem = warehouseItems.find(item => item.id === stockMovement.itemId);
    if (!selectedItem) return;

    const movementData: StockMovement = {
      id: String(stockMovements.length + 1),
      itemId: stockMovement.itemId,
      itemName: selectedItem.name,
      type: stockMovement.type,
      quantity: parseInt(stockMovement.quantity),
      fromLocation: stockMovement.fromLocation || undefined,
      toLocation: stockMovement.toLocation || undefined,
      reason: stockMovement.reason,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      operator: "Current User", // In real app, get from auth
      reference: stockMovement.reference || undefined
    };

    // In a real app, you'd add this to state and update item quantities
    console.log("Stock movement recorded:", movementData);
    alert("Stock movement recorded successfully! In production, this would update the database.");
    setShowStockMovementModal(false);
    setStockMovement({
      itemId: "", type: "in", quantity: "", fromLocation: "", toLocation: "", reason: "", reference: ""
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600">Track inventory, manage locations, and monitor stock movements</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddItemModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={16} />
            Add Item
          </button>
          <button 
            onClick={() => setShowStockMovementModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Truck size={16} />
            Stock Movement
          </button>
          <button 
            onClick={() => setShowLowStockAlerts(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
          >
            <AlertTriangle size={16} />
            Low Stock Alerts
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-green-600">{totalQuantity.toLocaleString()}</p>
            </div>
            <Box className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
            </div>
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">Rs. {totalValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "inventory", label: "Inventory", icon: Package },
              { id: "movements", label: "Stock Movements", icon: ArrowUpDown },
                             { id: "zones", label: "Warehouse Zones", icon: WarehouseIcon },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "inventory" && (
            <>
              {/* Filters and Search */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search items by name or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={16} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                                 <div className="flex items-center gap-2">
                   <WarehouseIcon className="text-gray-400" size={16} />
                   <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {zones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-gray-400" size={16} />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("-", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 rounded text-sm transition ${
                      viewMode === "grid" ? "bg-white shadow" : "text-gray-600"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-1 rounded text-sm transition ${
                      viewMode === "table" ? "bg-white shadow" : "text-gray-600"
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>

              {/* Inventory Items */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.sku}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {item.status.replace("-", " ")}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={14} />
                          {item.location} - {item.zone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Box size={14} />
                          {item.quantity.toLocaleString()} {item.unit}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Rs. {item.unitPrice}/{item.unit}</span>
                        </div>
                      </div>

                      {item.temperature && (
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Thermometer size={14} className="text-blue-500" />
                            <span className="text-gray-600">{item.temperature}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Palette size={14} className="text-green-500" />
                            <span className="text-gray-600">{item.humidity}</span>
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Stock Level</span>
                          <span className="font-medium">{Math.round((item.quantity / item.maxStock) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.quantity <= item.minStock ? "bg-red-500" :
                              item.quantity <= item.minStock * 1.5 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min((item.quantity / item.maxStock) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(item.condition)}`}>
                          {item.condition}
                        </span>
                        <div className="flex gap-1">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye size={16} />
                          </button>
                          <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                            <Edit size={16} />
                          </button>
                          <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Move size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Table View */
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Item</th>
                        <th className="text-left p-4 font-medium">Location</th>
                        <th className="text-left p-4 font-medium">Quantity</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Stock Level</th>
                        <th className="text-left p-4 font-medium">Last Updated</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.sku}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{item.location}</td>
                          <td className="p-4">
                            <span className="font-medium">{item.quantity.toLocaleString()}</span>
                            <span className="text-gray-600"> {item.unit}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                              {item.status.replace("-", " ")}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    item.quantity <= item.minStock ? "bg-red-500" :
                                    item.quantity <= item.minStock * 1.5 ? "bg-yellow-500" : "bg-green-500"
                                  }`}
                                  style={{ width: `${Math.min((item.quantity / item.maxStock) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm">{Math.round((item.quantity / item.maxStock) * 100)}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{item.lastUpdated}</td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <Eye size={16} />
                              </button>
                              <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <Move size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === "movements" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Stock Movements</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
                  <Plus size={16} />
                  New Movement
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Item</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Quantity</th>
                      <th className="text-left p-4 font-medium">Location</th>
                      <th className="text-left p-4 font-medium">Reason</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.map((movement) => (
                      <tr key={movement.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-medium">{movement.itemName}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            movement.type === "in" ? "bg-green-100 text-green-600" :
                            movement.type === "out" ? "bg-red-100 text-red-600" :
                            "bg-blue-100 text-blue-600"
                          }`}>
                            {movement.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 font-medium">{movement.quantity}</td>
                        <td className="p-4 text-sm">
                          {movement.type === "transfer" ? 
                            `${movement.fromLocation} → ${movement.toLocation}` :
                            movement.type === "in" ? movement.toLocation :
                            movement.fromLocation
                          }
                        </td>
                        <td className="p-4 text-sm text-gray-600">{movement.reason}</td>
                        <td className="p-4 text-sm text-gray-600">{movement.date}</td>
                        <td className="p-4 text-sm">{movement.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "zones" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouseZones.map((zone) => (
                <div key={zone.id} className="bg-gray-50 rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{zone.name}</h3>
                      <p className="text-sm text-gray-600">{zone.items} items</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      zone.status === "active" ? "bg-green-100 text-green-600" :
                      zone.status === "maintenance" ? "bg-yellow-100 text-yellow-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {zone.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer size={14} className="text-blue-500" />
                      <span className="text-gray-600">{zone.temperature}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Palette size={14} className="text-green-500" />
                      <span className="text-gray-600">{zone.humidity}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">Capacity Usage</span>
                      <span className="font-medium">{Math.round((zone.usedCapacity / zone.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          zone.usedCapacity / zone.capacity > 0.9 ? "bg-red-500" :
                          zone.usedCapacity / zone.capacity > 0.7 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${(zone.usedCapacity / zone.capacity) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {zone.usedCapacity.toLocaleString()} / {zone.capacity.toLocaleString()} units
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition">
                      View Items
                    </button>
                    <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg border p-4">
                <h3 className="font-semibold text-lg mb-4">Stock Level Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Stock</span>
                    <span className="font-medium text-green-600">
                      {warehouseItems.filter(item => item.status === "in-stock").length} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Stock</span>
                    <span className="font-medium text-yellow-600">
                      {warehouseItems.filter(item => item.status === "low-stock").length} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Out of Stock</span>
                    <span className="font-medium text-red-600">
                      {warehouseItems.filter(item => item.status === "out-of-stock").length} items
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border p-4">
                <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {stockMovements.slice(0, 5).map((movement) => (
                    <div key={movement.id} className="flex items-center gap-3">
                      <div className={`p-1 rounded ${
                        movement.type === "in" ? "bg-green-100" :
                        movement.type === "out" ? "bg-red-100" : "bg-blue-100"
                      }`}>
                        {movement.type === "in" ? <TrendingUp size={12} className="text-green-600" /> :
                         movement.type === "out" ? <TrendingDown size={12} className="text-red-600" /> :
                         <ArrowUpDown size={12} className="text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{movement.itemName}</p>
                        <p className="text-xs text-gray-600">{movement.reason}</p>
                      </div>
                      <span className="text-xs text-gray-500">{movement.date.split(" ")[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredItems.length === 0 && activeTab === "inventory" && (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">No items match your current search criteria.</p>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Warehouse Item</h2>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.filter(cat => cat !== "All").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (Rs.) *</label>
                  <input
                    type="number"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter unit price"
                  />
                </div>
              </div>

              {/* Location & Stock Management */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Location & Stock Management</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
                  <select
                    value={newItem.zone}
                    onChange={(e) => setNewItem({...newItem, zone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {zones.filter(zone => zone !== "All").map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={newItem.location}
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., A-01-01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
                    <input
                      type="text"
                      value={newItem.rack}
                      onChange={(e) => setNewItem({...newItem, rack: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., A1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
                    <input
                      type="text"
                      value={newItem.shelf}
                      onChange={(e) => setNewItem({...newItem, shelf: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock *</label>
                    <input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Minimum stock level"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                    <input
                      type="number"
                      value={newItem.maxStock}
                      onChange={(e) => setNewItem({...newItem, maxStock: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Maximum stock level"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                  <input
                    type="text"
                    value={newItem.temperature}
                    onChange={(e) => setNewItem({...newItem, temperature: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 4°C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Humidity</label>
                  <input
                    type="text"
                    value={newItem.humidity}
                    onChange={(e) => setNewItem({...newItem, humidity: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 85%"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Additional notes about the item"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name || !newItem.sku || !newItem.quantity || !newItem.unitPrice || !newItem.location}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showStockMovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Record Stock Movement</h2>
              <button
                onClick={() => setShowStockMovementModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                <select
                  value={stockMovement.itemId}
                  onChange={(e) => setStockMovement({...stockMovement, itemId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an item</option>
                  {warehouseItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - Current: {item.quantity} {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type *</label>
                <select
                  value={stockMovement.type}
                  onChange={(e) => setStockMovement({...stockMovement, type: e.target.value as "in" | "out" | "transfer" | "adjustment"})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in">Stock In (Receiving)</option>
                  <option value="out">Stock Out (Issuing)</option>
                  <option value="transfer">Transfer (Between Locations)</option>
                  <option value="adjustment">Adjustment (Correction)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={stockMovement.quantity}
                  onChange={(e) => setStockMovement({...stockMovement, quantity: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
              </div>

              {stockMovement.type === "in" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Location *</label>
                  <input
                    type="text"
                    value={stockMovement.toLocation}
                    onChange={(e) => setStockMovement({...stockMovement, toLocation: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A-01-01"
                  />
                </div>
              )}

              {stockMovement.type === "out" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Location *</label>
                  <input
                    type="text"
                    value={stockMovement.fromLocation}
                    onChange={(e) => setStockMovement({...stockMovement, fromLocation: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A-01-01"
                  />
                </div>
              )}

              {stockMovement.type === "transfer" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Location *</label>
                    <input
                      type="text"
                      value={stockMovement.fromLocation}
                      onChange={(e) => setStockMovement({...stockMovement, fromLocation: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., A-01-01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Location *</label>
                    <input
                      type="text"
                      value={stockMovement.toLocation}
                      onChange={(e) => setStockMovement({...stockMovement, toLocation: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., A-01-02"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <input
                  type="text"
                  value={stockMovement.reason}
                  onChange={(e) => setStockMovement({...stockMovement, reason: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Production order, New shipment, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={stockMovement.reference}
                  onChange={(e) => setStockMovement({...stockMovement, reference: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., PO-2024-001, WO-2024-015"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowStockMovementModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStockMovement}
                disabled={!stockMovement.itemId || !stockMovement.quantity || !stockMovement.reason}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                Record Movement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alerts Modal */}
      {showLowStockAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Low Stock Alerts</h2>
              <button
                onClick={() => setShowLowStockAlerts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {lowStockAlerts.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto text-green-500 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Low Stock Alerts</h3>
                <p className="text-gray-600">All items are above their minimum stock levels.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-yellow-600" size={20} />
                    <p className="text-yellow-800 font-medium">
                      {lowStockAlerts.length} item{lowStockAlerts.length > 1 ? 's' : ''} require{lowStockAlerts.length > 1 ? '' : 's'} immediate attention
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Item</th>
                          <th className="text-left p-4 font-medium">Current Stock</th>
                          <th className="text-left p-4 font-medium">Min Stock</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Last Updated</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockAlerts.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">{item.sku}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`font-medium ${
                                item.quantity === 0 ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {item.quantity} {item.unit}
                              </span>
                            </td>
                            <td className="p-4 text-sm">{item.minStock} {item.unit}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.status === "out-of-stock" ? "bg-red-100 text-red-600" :
                                "bg-yellow-100 text-yellow-600"
                              }`}>
                                {item.status === "out-of-stock" ? "Out of Stock" : "Low Stock"}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{item.lastUpdated}</td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setStockMovement({
                                    ...stockMovement,
                                    itemId: item.id,
                                    type: "in",
                                    reason: "Restocking due to low stock alert"
                                  });
                                  setShowLowStockAlerts(false);
                                  setShowStockMovementModal(true);
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                              >
                                Restock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowLowStockAlerts(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
