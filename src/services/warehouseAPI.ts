import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================
// WAREHOUSE ZONES API
// ========================

export const warehouseZonesAPI = {
  // Get all warehouse zones
  getAll: () => api.get("/warehouse/zones"),
  
  // Get single warehouse zone
  getById: (id: string) => api.get(`/warehouse/zones/${id}`),
  
  // Create new warehouse zone
  create: (data: any) => api.post("/warehouse/zones", data),
  
  // Update warehouse zone
  update: (id: string, data: any) => api.put(`/warehouse/zones/${id}`, data),
  
  // Delete warehouse zone
  delete: (id: string) => api.delete(`/warehouse/zones/${id}`),
};

// ========================
// INVENTORY API
// ========================

export const inventoryAPI = {
  // Get all inventory items
  getAll: (params?: any) => api.get("/inventory/all_inventory", { params }),
  
  // Get single inventory item
  getById: (id: string) => api.get(`/inventory/${id}`),
  
  // Create new inventory item
  create: (data: any) => api.post("/inventory/add_inventory", data),
  
  // Update inventory item
  update: (id: string, data: any) => api.put(`/inventory/edit_inventory/${id}`, data),
  
  // Update stock only
  updateStock: (id: string, currentStock: number) => 
    api.put(`/inventory/update_stock/${id}`, { currentStock }),
  
  // Delete inventory item
  delete: (id: string) => api.delete(`/inventory/${id}`),
};

// ========================
// STOCK MOVEMENTS API
// ========================

export const stockMovementsAPI = {
  // Get all stock movements
  getAll: (params?: any) => api.get("/warehouse/stock-movements", { params }),
  
  // Create new stock movement
  create: (data: any) => api.post("/warehouse/stock-movements", data),
};

// ========================
// LOW STOCK ALERTS API
// ========================

export const lowStockAPI = {
  // Get low stock items
  getAll: () => api.get("/warehouse/low-stock"),
  
  // Update alert status
  updateAlert: (id: string, lowStockAlerted: boolean) => 
    api.put(`/warehouse/low-stock-alert/${id}`, { lowStockAlerted }),
};

// ========================
// WAREHOUSE ANALYTICS API
// ========================

export const analyticsAPI = {
  // Get warehouse analytics
  get: () => api.get("/warehouse/analytics"),
};

// ========================
// TYPES
// ========================

export interface WarehouseZone {
  _id?: string;
  name: string;
  code: string;
  capacity: number;
  usedCapacity: number;
  temperature: string;
  humidity: string;
  status: "active" | "maintenance" | "full" | "inactive";
  description?: string;
  location?: string;
  maxTemperature?: number;
  minTemperature?: number;
  maxHumidity?: number;
  minHumidity?: number;
  items?: number;
  utilizationPercentage?: number;
}

export interface InventoryItem {
  _id?: string;
  name: string;
  sku: string;
  type: string;
  category: string;
  availability: boolean;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  unit: string;
  zone?: WarehouseZone | string;
  location?: string;
  rack?: string;
  shelf?: string;
  supplier?: string;
  expiryDate?: string;
  temperature?: string;
  humidity?: string;
  status: "in-stock" | "low-stock" | "out-of-stock" | "expired";
  condition: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  lowStockAlerted?: boolean;
  lastRestockDate?: string;
}

export interface StockMovement {
  _id?: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "transfer" | "adjustment";
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  fromZone?: string;
  toZone?: string;
  reason: string;
  operator: string;
  reference?: string;
  notes?: string;
  status: "pending" | "completed" | "cancelled";
  unitPrice?: number;
  totalValue?: number;
  createdAt?: string;
}

export interface WarehouseAnalytics {
  totalItems: number;
  totalStock: number;
  lowStockCount: number;
  totalValue: number;
  zoneUtilization: Array<{
    name: string;
    capacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
  }>;
  recentMovements: number;
}

export default api;