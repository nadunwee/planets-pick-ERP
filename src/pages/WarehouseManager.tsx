import React, { useState } from "react";
import { useWarehouseData } from "../hooks/useWarehouseData";
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Warehouse as WarehouseIcon,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

// Interface for new zone form
interface NewZoneForm {
  name: string;
  code: string;
  capacity: string;
  temperature: string;
  humidity: string;
  description: string;
  location: string;
}

// Interface for new item form
interface NewItemForm {
  name: string;
  sku: string;
  type: string;
  category: string;
  currentStock: string;
  minStock: string;
  maxStock: string;
  unitPrice: string;
  unit: string;
  zone: string;
  location: string;
  rack: string;
  shelf: string;
  supplier: string;
  condition: string;
  notes: string;
}

export default function WarehouseManager() {
  const {
    zones,
    inventory,
    movements,
    lowStockItems,
    analytics,
    loading,
    error,
    createZone,
    createItem,
    updateItem,
    deleteItem,
    deleteZone,
    createMovement,
    setError,
  } = useWarehouseData();

  const [activeTab, setActiveTab] = useState<"inventory" | "zones" | "movements" | "analytics">("inventory");
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showStockMovementModal, setShowStockMovementModal] = useState(false);

  // Form states
  const [newZone, setNewZone] = useState<NewZoneForm>({
    name: "",
    code: "",
    capacity: "",
    temperature: "Room Temperature",
    humidity: "50%",
    description: "",
    location: "",
  });

  const [newItem, setNewItem] = useState<NewItemForm>({
    name: "",
    sku: "",
    type: "",
    category: "Vegetables",
    currentStock: "",
    minStock: "",
    maxStock: "",
    unitPrice: "",
    unit: "kg",
    zone: "",
    location: "",
    rack: "",
    shelf: "",
    supplier: "",
    condition: "good",
    notes: "",
  });

  const [stockMovement, setStockMovement] = useState({
    itemId: "",
    type: "in" as "in" | "out" | "transfer" | "adjustment",
    quantity: "",
    fromLocation: "",
    toLocation: "",
    reason: "",
    operator: "",
    reference: "",
    notes: "",
  });

  // Handle creating new zone
  const handleCreateZone = async () => {
    try {
      await createZone({
        name: newZone.name,
        code: newZone.code,
        capacity: parseInt(newZone.capacity),
        temperature: newZone.temperature,
        humidity: newZone.humidity,
        description: newZone.description,
        location: newZone.location,
        usedCapacity: 0,
        status: "active",
      });
      
      setShowAddZoneModal(false);
      setNewZone({
        name: "",
        code: "",
        capacity: "",
        temperature: "Room Temperature",
        humidity: "50%",
        description: "",
        location: "",
      });
      
      alert("Zone created successfully!");
    } catch (error) {
      console.error("Failed to create zone:", error);
    }
  };

  // Handle creating new item
  const handleCreateItem = async () => {
    try {
      await createItem({
        name: newItem.name,
        sku: newItem.sku,
        type: newItem.type,
        category: newItem.category,
        availability: true,
        currentStock: parseInt(newItem.currentStock),
        minStock: parseInt(newItem.minStock),
        maxStock: parseInt(newItem.maxStock),
        unitPrice: parseFloat(newItem.unitPrice),
        unit: newItem.unit,
        zone: newItem.zone || undefined,
        location: newItem.location,
        rack: newItem.rack,
        shelf: newItem.shelf,
        supplier: newItem.supplier,
        condition: newItem.condition as "excellent" | "good" | "fair" | "poor",
        status: "in-stock",
        notes: newItem.notes,
      });
      
      setShowAddItemModal(false);
      setNewItem({
        name: "",
        sku: "",
        type: "",
        category: "Vegetables",
        currentStock: "",
        minStock: "",
        maxStock: "",
        unitPrice: "",
        unit: "kg",
        zone: "",
        location: "",
        rack: "",
        shelf: "",
        supplier: "",
        condition: "good",
        notes: "",
      });
      
      alert("Item created successfully!");
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  // Handle creating stock movement
  const handleCreateMovement = async () => {
    try {
      await createMovement({
        itemId: stockMovement.itemId,
        itemName: inventory.find(item => item._id === stockMovement.itemId)?.name || "",
        type: stockMovement.type,
        quantity: parseInt(stockMovement.quantity),
        fromLocation: stockMovement.fromLocation,
        toLocation: stockMovement.toLocation,
        reason: stockMovement.reason,
        operator: stockMovement.operator,
        reference: stockMovement.reference,
        notes: stockMovement.notes,
        status: "pending",
      });
      
      setShowStockMovementModal(false);
      setStockMovement({
        itemId: "",
        type: "in",
        quantity: "",
        fromLocation: "",
        toLocation: "",
        reason: "",
        operator: "",
        reference: "",
        notes: "",
      });
      
      alert("Stock movement created successfully!");
    } catch (error) {
      console.error("Failed to create movement:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading warehouse data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600">Manage inventory, zones, and stock movements</p>
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
            onClick={() => setShowAddZoneModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <WarehouseIcon size={16} />
            Add Zone
          </button>
          <button
            onClick={() => setShowStockMovementModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
          >
            <Package size={16} />
            Stock Movement
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="text-red-400 mr-2" size={20} />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Stock</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalStock.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
            <p className="text-2xl font-bold text-red-600">{analytics.lowStockCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
            <p className="text-2xl font-bold text-green-600">Rs. {analytics.totalValue.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b px-6 py-3">
          <nav className="flex space-x-8">
            {["inventory", "zones", "movements", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Inventory Items</h2>
              {inventory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No inventory items found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">SKU</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-left p-3 font-medium">Stock</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Zone</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3 text-gray-600">{item.sku}</td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3">
                            {item.currentStock} {item.unit}
                            <br />
                            <span className="text-xs text-gray-500">
                              Min: {item.minStock} {item.unit}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.status === "in-stock" ? "bg-green-100 text-green-600" :
                              item.status === "low-stock" ? "bg-yellow-100 text-yellow-600" :
                              item.status === "out-of-stock" ? "bg-red-100 text-red-600" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {typeof item.zone === "object" && item.zone ? item.zone.name : "Unassigned"}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Eye size={16} />
                              </button>
                              <button className="text-gray-600 hover:text-gray-800">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (item._id && confirm("Are you sure you want to delete this item?")) {
                                    deleteItem(item._id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Zones Tab */}
          {activeTab === "zones" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Warehouse Zones</h2>
              {zones.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No zones found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {zones.map((zone) => (
                    <div key={zone._id} className="bg-gray-50 rounded-lg border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{zone.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          zone.status === "active" ? "bg-green-100 text-green-600" :
                          zone.status === "full" ? "bg-red-100 text-red-600" :
                          zone.status === "maintenance" ? "bg-yellow-100 text-yellow-600" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {zone.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Code: {zone.code}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Capacity: {zone.usedCapacity?.toLocaleString()} / {zone.capacity?.toLocaleString()} units
                      </p>
                      {zone.utilizationPercentage !== undefined && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(zone.utilizationPercentage, 100)}%` }}
                          ></div>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Temp: {zone.temperature}</span>
                        <span>Humidity: {zone.humidity}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition">
                          View Items
                        </button>
                        <button 
                          onClick={() => {
                            if (zone._id && confirm("Are you sure you want to delete this zone?")) {
                              deleteZone(zone._id);
                            }
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stock Movements Tab */}
          {activeTab === "movements" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Stock Movements</h2>
              {movements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No stock movements found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Item</th>
                        <th className="text-left p-3 font-medium">Type</th>
                        <th className="text-left p-3 font-medium">Quantity</th>
                        <th className="text-left p-3 font-medium">Location</th>
                        <th className="text-left p-3 font-medium">Reason</th>
                        <th className="text-left p-3 font-medium">Operator</th>
                        <th className="text-left p-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((movement) => (
                        <tr key={movement._id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{movement.itemName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              movement.type === "in" ? "bg-green-100 text-green-600" :
                              movement.type === "out" ? "bg-red-100 text-red-600" :
                              movement.type === "transfer" ? "bg-blue-100 text-blue-600" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {movement.type}
                            </span>
                          </td>
                          <td className="p-3">{movement.quantity}</td>
                          <td className="p-3">
                            {movement.type === "transfer" 
                              ? `${movement.fromLocation} → ${movement.toLocation}`
                              : movement.type === "in" 
                              ? movement.toLocation 
                              : movement.fromLocation}
                          </td>
                          <td className="p-3 text-sm">{movement.reason}</td>
                          <td className="p-3 text-sm">{movement.operator}</td>
                          <td className="p-3 text-sm">
                            {movement.createdAt ? new Date(movement.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && analytics && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Warehouse Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg border p-4">
                  <h3 className="font-semibold text-lg mb-4">Zone Utilization</h3>
                  <div className="space-y-3">
                    {analytics.zoneUtilization.map((zone, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm">
                          <span>{zone.name}</span>
                          <span>{zone.utilizationPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(zone.utilizationPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg border p-4">
                  <h3 className="font-semibold text-lg mb-4">Low Stock Alerts</h3>
                  {lowStockItems.length === 0 ? (
                    <p className="text-green-600">All items are well stocked!</p>
                  ) : (
                    <div className="space-y-2">
                      {lowStockItems.slice(0, 5).map((item) => (
                        <div key={item._id} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            {item.currentStock}/{item.minStock} {item.unit}
                          </span>
                        </div>
                      ))}
                      {lowStockItems.length > 5 && (
                        <p className="text-xs text-gray-500">
                          +{lowStockItems.length - 5} more items
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Zone</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name *</label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cold Storage A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Code *</label>
                <input
                  type="text"
                  value={newZone.code}
                  onChange={(e) => setNewZone({ ...newZone, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CS-A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (units) *</label>
                <input
                  type="number"
                  value={newZone.capacity}
                  onChange={(e) => setNewZone({ ...newZone, capacity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                  <input
                    type="text"
                    value={newZone.temperature}
                    onChange={(e) => setNewZone({ ...newZone, temperature: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 4°C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Humidity</label>
                  <input
                    type="text"
                    value={newZone.humidity}
                    onChange={(e) => setNewZone({ ...newZone, humidity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 85%"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newZone.description}
                  onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Zone description..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateZone}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!newZone.name || !newZone.code || !newZone.capacity}
              >
                Create Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <input
                    type="text"
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Raw Materials">Raw Materials</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Stock & Location</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
                    <input
                      type="number"
                      value={newItem.currentStock}
                      onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock *</label>
                    <input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                    <input
                      type="number"
                      value={newItem.maxStock}
                      onChange={(e) => setNewItem({ ...newItem, maxStock: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="kg">kg</option>
                      <option value="pieces">pieces</option>
                      <option value="liters">liters</option>
                      <option value="boxes">boxes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <select
                    value={newItem.zone}
                    onChange={(e) => setNewItem({ ...newItem, zone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Zone</option>
                    {zones.map((zone) => (
                      <option key={zone._id} value={zone._id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={newItem.location}
                      onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="A-01-01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
                    <input
                      type="text"
                      value={newItem.rack}
                      onChange={(e) => setNewItem({ ...newItem, rack: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="A1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
                    <input
                      type="text"
                      value={newItem.shelf}
                      onChange={(e) => setNewItem({ ...newItem, shelf: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={!newItem.name || !newItem.sku || !newItem.type || !newItem.currentStock || !newItem.minStock || !newItem.unitPrice}
              >
                Create Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showStockMovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Stock Movement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                <select
                  value={stockMovement.itemId}
                  onChange={(e) => setStockMovement({ ...stockMovement, itemId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Item</option>
                  {inventory.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type *</label>
                <select
                  value={stockMovement.type}
                  onChange={(e) => setStockMovement({ ...stockMovement, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                  <option value="transfer">Transfer</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={stockMovement.quantity}
                  onChange={(e) => setStockMovement({ ...stockMovement, quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {stockMovement.type === "in" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
                  <input
                    type="text"
                    value={stockMovement.toLocation}
                    onChange={(e) => setStockMovement({ ...stockMovement, toLocation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
              {stockMovement.type === "out" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
                  <input
                    type="text"
                    value={stockMovement.fromLocation}
                    onChange={(e) => setStockMovement({ ...stockMovement, fromLocation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
              {stockMovement.type === "transfer" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
                    <input
                      type="text"
                      value={stockMovement.fromLocation}
                      onChange={(e) => setStockMovement({ ...stockMovement, fromLocation: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
                    <input
                      type="text"
                      value={stockMovement.toLocation}
                      onChange={(e) => setStockMovement({ ...stockMovement, toLocation: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <input
                  type="text"
                  value={stockMovement.reason}
                  onChange={(e) => setStockMovement({ ...stockMovement, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., New stock arrival, Production order"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operator *</label>
                <input
                  type="text"
                  value={stockMovement.operator}
                  onChange={(e) => setStockMovement({ ...stockMovement, operator: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Operator name"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowStockMovementModal(false)}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMovement}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                disabled={!stockMovement.itemId || !stockMovement.quantity || !stockMovement.reason || !stockMovement.operator}
              >
                Create Movement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}