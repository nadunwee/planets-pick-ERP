import React from "react";
import { useWarehouseData } from "../hooks/useWarehouseData";

export default function WarehouseTest() {
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
  } = useWarehouseData();

  const handleTestZone = async () => {
    try {
      await createZone({
        name: "Test Zone",
        code: "TZ-001",
        capacity: 1000,
        usedCapacity: 0,
        temperature: "20°C",
        humidity: "60%",
        status: "active",
        description: "Test zone for warehouse functionality",
      });
      alert("Zone created successfully!");
    } catch (error) {
      console.error("Failed to create zone:", error);
      alert("Failed to create zone. Check console for details.");
    }
  };

  const handleTestItem = async () => {
    try {
      await createItem({
        name: "Test Item",
        sku: "TEST-001",
        type: "Test Type",
        category: "Vegetables",
        availability: true,
        currentStock: 100,
        minStock: 10,
        maxStock: 500,
        unitPrice: 50,
        unit: "kg",
        condition: "good",
        status: "in-stock",
      });
      alert("Item created successfully!");
    } catch (error) {
      console.error("Failed to create item:", error);
      alert("Failed to create item. Check console for details.");
    }
  };

  if (loading) {
    return <div className="p-8">Loading warehouse data...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Warehouse Backend Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Actions */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Test Actions</h2>
          <div className="space-y-2">
            <button
              onClick={handleTestZone}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Test Zone
            </button>
            <button
              onClick={handleTestItem}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Test Item
            </button>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Analytics</h2>
          {analytics ? (
            <div className="space-y-2">
              <p>Total Items: {analytics.totalItems}</p>
              <p>Total Stock: {analytics.totalStock}</p>
              <p>Low Stock Count: {analytics.lowStockCount}</p>
              <p>Total Value: Rs. {analytics.totalValue.toLocaleString()}</p>
              <p>Recent Movements: {analytics.recentMovements}</p>
            </div>
          ) : (
            <p className="text-gray-500">No analytics data available</p>
          )}
        </div>

        {/* Zones */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Zones ({zones.length})</h2>
          {zones.length > 0 ? (
            <div className="space-y-2">
              {zones.map((zone) => (
                <div key={zone._id} className="border p-2 rounded">
                  <p className="font-medium">{zone.name}</p>
                  <p className="text-sm text-gray-600">Code: {zone.code}</p>
                  <p className="text-sm text-gray-600">
                    Capacity: {zone.usedCapacity}/{zone.capacity}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No zones found</p>
          )}
        </div>

        {/* Inventory */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Inventory ({inventory.length})</h2>
          {inventory.length > 0 ? (
            <div className="space-y-2">
              {inventory.slice(0, 5).map((item) => (
                <div key={item._id} className="border p-2 rounded">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  <p className="text-sm text-gray-600">
                    Stock: {item.currentStock} {item.unit}
                  </p>
                  <p className="text-sm text-gray-600">Status: {item.status}</p>
                </div>
              ))}
              {inventory.length > 5 && (
                <p className="text-sm text-gray-500">
                  +{inventory.length - 5} more items
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No inventory found</p>
          )}
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Low Stock Items ({lowStockItems.length})</h2>
          {lowStockItems.length > 0 ? (
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item._id} className="border border-red-200 p-2 rounded bg-red-50">
                  <p className="font-medium text-red-800">{item.name}</p>
                  <p className="text-sm text-red-600">
                    Stock: {item.currentStock}/{item.minStock} {item.unit}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600">All items are well stocked!</p>
          )}
        </div>

        {/* Recent Movements */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Recent Movements ({movements.length})</h2>
          {movements.length > 0 ? (
            <div className="space-y-2">
              {movements.slice(0, 5).map((movement) => (
                <div key={movement._id} className="border p-2 rounded">
                  <p className="font-medium">{movement.itemName}</p>
                  <p className="text-sm text-gray-600">
                    Type: {movement.type} | Qty: {movement.quantity}
                  </p>
                  <p className="text-sm text-gray-600">Reason: {movement.reason}</p>
                  <p className="text-sm text-gray-600">Operator: {movement.operator}</p>
                </div>
              ))}
              {movements.length > 5 && (
                <p className="text-sm text-gray-500">
                  +{movements.length - 5} more movements
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No movements found</p>
          )}
        </div>
      </div>
    </div>
  );
}