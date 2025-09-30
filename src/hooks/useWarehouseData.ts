import { useState, useEffect } from "react";
import {
  warehouseZonesAPI,
  inventoryAPI,
  stockMovementsAPI,
  lowStockAPI,
  analyticsAPI,
  WarehouseZone,
  InventoryItem,
  StockMovement,
  WarehouseAnalytics,
} from "../services/warehouseAPI";

export const useWarehouseData = () => {
  const [zones, setZones] = useState<WarehouseZone[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [analytics, setAnalytics] = useState<WarehouseAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all warehouse data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        zonesResponse,
        inventoryResponse,
        movementsResponse,
        lowStockResponse,
        analyticsResponse,
      ] = await Promise.all([
        warehouseZonesAPI.getAll(),
        inventoryAPI.getAll(),
        stockMovementsAPI.getAll({ limit: 20 }),
        lowStockAPI.getAll(),
        analyticsAPI.get(),
      ]);

      setZones(zonesResponse.data);
      setInventory(inventoryResponse.data);
      setMovements(movementsResponse.data.movements || movementsResponse.data);
      setLowStockItems(lowStockResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (err: any) {
      console.error("Error loading warehouse data:", err);
      setError(err.response?.data?.error || "Failed to load warehouse data");
    } finally {
      setLoading(false);
    }
  };

  // Zone operations
  const createZone = async (zoneData: Omit<WarehouseZone, "_id">) => {
    try {
      const response = await warehouseZonesAPI.create(zoneData);
      setZones(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create zone");
      throw err;
    }
  };

  const updateZone = async (id: string, zoneData: Partial<WarehouseZone>) => {
    try {
      const response = await warehouseZonesAPI.update(id, zoneData);
      setZones(prev => prev.map(zone => 
        zone._id === id ? response.data : zone
      ));
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update zone");
      throw err;
    }
  };

  const deleteZone = async (id: string) => {
    try {
      await warehouseZonesAPI.delete(id);
      setZones(prev => prev.filter(zone => zone._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete zone");
      throw err;
    }
  };

  // Inventory operations
  const createItem = async (itemData: Omit<InventoryItem, "_id">) => {
    try {
      const response = await inventoryAPI.create(itemData);
      setInventory(prev => [...prev, response.data]);
      // Refresh analytics after adding item
      loadAnalytics();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create item");
      throw err;
    }
  };

  const updateItem = async (id: string, itemData: Partial<InventoryItem>) => {
    try {
      const response = await inventoryAPI.update(id, itemData);
      setInventory(prev => prev.map(item => 
        item._id === id ? response.data : item
      ));
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update item");
      throw err;
    }
  };

  const updateStock = async (id: string, currentStock: number) => {
    try {
      const response = await inventoryAPI.updateStock(id, currentStock);
      setInventory(prev => prev.map(item => 
        item._id === id ? response.data : item
      ));
      // Refresh low stock items and analytics
      loadLowStockItems();
      loadAnalytics();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update stock");
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await inventoryAPI.delete(id);
      setInventory(prev => prev.filter(item => item._id !== id));
      loadAnalytics();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete item");
      throw err;
    }
  };

  // Stock movement operations
  const createMovement = async (movementData: Omit<StockMovement, "_id">) => {
    try {
      const response = await stockMovementsAPI.create(movementData);
      setMovements(prev => [response.data, ...prev]);
      // Refresh inventory and analytics
      loadInventory();
      loadAnalytics();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create movement");
      throw err;
    }
  };

  // Load specific data
  const loadZones = async () => {
    try {
      const response = await warehouseZonesAPI.getAll();
      setZones(response.data);
    } catch (err: any) {
      console.error("Error loading zones:", err);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
    } catch (err: any) {
      console.error("Error loading inventory:", err);
    }
  };

  const loadMovements = async () => {
    try {
      const response = await stockMovementsAPI.getAll({ limit: 20 });
      setMovements(response.data.movements || response.data);
    } catch (err: any) {
      console.error("Error loading movements:", err);
    }
  };

  const loadLowStockItems = async () => {
    try {
      const response = await lowStockAPI.getAll();
      setLowStockItems(response.data);
    } catch (err: any) {
      console.error("Error loading low stock items:", err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await analyticsAPI.get();
      setAnalytics(response.data);
    } catch (err: any) {
      console.error("Error loading analytics:", err);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  return {
    // Data
    zones,
    inventory,
    movements,
    lowStockItems,
    analytics,
    loading,
    error,

    // Actions
    loadData,
    
    // Zone operations
    createZone,
    updateZone,
    deleteZone,
    loadZones,

    // Inventory operations
    createItem,
    updateItem,
    updateStock,
    deleteItem,
    loadInventory,

    // Movement operations
    createMovement,
    loadMovements,

    // Low stock operations
    loadLowStockItems,

    // Analytics
    loadAnalytics,

    // Utility
    setError,
  };
};