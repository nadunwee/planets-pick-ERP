import { useState } from "react";
import {
  Package,
  Plus,
  Filter,
  Truck,
  ArrowUpDown,
  AlertTriangle,
  BarChart3,
  Warehouse as WarehouseIcon,
  Box,
  Palette,
  Thermometer,
  Edit,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";

type StageStatus = "pending" | "in-progress" | "completed";

interface ProductionStage {
  id: string;
  name: string;
  warehouse: string;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
}

interface QualityChecks {
  rawInspection: boolean;
  midProcessAudit: boolean;
  prePackCheck: boolean;
  finalQC: boolean;
}

interface ProductionOrder {
  id: string;
  productName: string;
  productSku: string;
  requiredQuantity: number;
  producedQuantity: number;
  stages: ProductionStage[];
  qa: QualityChecks;
  status: "in_progress" | "ready" | "delivered";
  deliveredAt?: string;
}

interface ProcessPlatform {
  id: string; // process_warehouse no
  itemSku: string;
  itemName: string;
  tasks: { id: string; name: string; done: boolean }[];
  status: "in_progress" | "ready" | "delivered";
  createdAt: string;
  deliveredAt?: string;
}

interface DeliveredReportRecord {
  id: string;
  processId: string;
  itemSku: string;
  itemName: string;
  deliveredAt: string;
  notes?: string;
}

interface WastageRecord {
  id: string;
  processId: string;
  itemSku: string;
  itemName: string;
  failedAt: string;
  reason: string;
}

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

const productCatalog = [
  { name: "Virgin Coconut Oil", sku: "VCO-001", unit: "l", category: "Oil", defaultZone: "Warehouse 01 - Raw Materials" },
  { name: "Dried Jackfruit", sku: "DJF-002", unit: "kg", category: "Dehydrated", defaultZone: "Warehouse 01 - Raw Materials" },
  { name: "Coconut Flour", sku: "CCF-003", unit: "kg", category: "Flour", defaultZone: "Warehouse 01 - Raw Materials" },
  { name: "Coconut Milk", sku: "CCM-004", unit: "l", category: "Milk", defaultZone: "Warehouse 01 - Raw Materials" },
];

const initialWarehouseItems: WarehouseItem[] = [
  {
    id: "1",
    name: "Virgin Coconut Oil",
    sku: "VCO-001",
    category: "Oil",
    quantity: 3200,
    minStock: 1000,
    maxStock: 6000,
    location: "W01-01-01",
    zone: "Warehouse 01 - Raw Materials",
    rack: "RM1",
    shelf: "01",
    unit: "l",
    unitPrice: 850,
    supplier: "Coconut Estates Ltd",
    lastUpdated: "2025-01-15 10:30",
    temperature: "18°C",
    humidity: "60%",
    status: "in-stock",
    condition: "excellent",
  },
  {
    id: "2",
    name: "Dried Jackfruit",
    sku: "DJF-002",
    category: "Dehydrated",
    quantity: 780,
    minStock: 300,
    maxStock: 2000,
    location: "W03-02-05",
    zone: "Warehouse 03 - Cutting & Preparation",
    rack: "CP2",
    shelf: "05",
    unit: "kg",
    unitPrice: 1200,
    supplier: "Tropical Harvest Co",
    lastUpdated: "2025-01-15 11:10",
    temperature: "18°C",
    humidity: "55%",
    status: "in-stock",
    condition: "good",
  },
  {
    id: "3",
    name: "Coconut Flour",
    sku: "CCF-003",
    category: "Flour",
    quantity: 420,
    minStock: 250,
    maxStock: 1500,
    location: "W05-01-03",
    zone: "Warehouse 05 - Packing",
    rack: "PK1",
    shelf: "03",
    unit: "kg",
    unitPrice: 450,
    supplier: "Island Coconut Mills",
    lastUpdated: "2025-01-14 16:45",
    temperature: "18°C",
    humidity: "50%",
    status: "low-stock",
    condition: "excellent",
  },
  {
    id: "4",
    name: "Coconut Milk",
    sku: "CCM-004",
    category: "Milk",
    quantity: 0,
    minStock: 400,
    maxStock: 2200,
    location: "W02-03-02",
    zone: "Warehouse 02 - Washing & Sorting",
    rack: "WS3",
    shelf: "02",
    unit: "l",
    unitPrice: 300,
    supplier: "Island Coconut Mills",
    lastUpdated: "2025-01-15 09:20",
    status: "out-of-stock",
    condition: "good",
  },
];

const stockMovements: StockMovement[] = [
  {
    id: "1",
    itemId: "1",
    itemName: "Virgin Coconut Oil",
    type: "in",
    quantity: 1200,
    toLocation: "W01-01-01",
    reason: "Coconut oil crude received",
    date: "2025-01-15 10:30",
    operator: "Tharindu Perera",
    reference: "PO-2025-001",
  },
  {
    id: "2",
    itemId: "2",
    itemName: "Dried Jackfruit",
    type: "transfer",
    quantity: 150,
    fromLocation: "W02-01-04",
    toLocation: "W03-02-05",
    reason: "After washing & sorting → cutting & preparation",
    date: "2025-01-15 11:45",
    operator: "Nadeesha Silva",
    reference: "WO-2025-015",
  },
  {
    id: "3",
    itemId: "3",
    itemName: "Coconut Flour",
    type: "in",
    quantity: 200,
    toLocation: "W05-01-03",
    reason: "Packed flour received from packing",
    date: "2025-01-14 16:50",
    operator: "Ishara Fernando",
  },
  {
    id: "4",
    itemId: "4",
    itemName: "Coconut Milk",
    type: "out",
    quantity: 400,
    fromLocation: "W02-03-02",
    reason: "Issued to processing/evaporation",
    date: "2025-01-15 09:25",
    operator: "Amaya Jayawardena",
    reference: "WO-2025-021",
  },
];

const warehouseZones: WarehouseZone[] = [
  {
    id: "1",
    name: "Warehouse 01 - Raw Materials",
    capacity: 5000,
    usedCapacity: 3500,
    temperature: "Ambient/Cold",
    humidity: "85%",
    items: 10,
    status: "active",
  },
  {
    id: "2",
    name: "Warehouse 02 - Washing & Sorting",
    capacity: 3000,
    usedCapacity: 1200,
    temperature: "4°C",
    humidity: "80%",
    items: 6,
    status: "active",
  },
  {
    id: "3",
    name: "Warehouse 03 - Cutting & Preparation",
    capacity: 4000,
    usedCapacity: 2000,
    temperature: "12°C",
    humidity: "65%",
    items: 5,
    status: "active",
  },
  {
    id: "4",
    name: "Warehouse 04 - Incubation (QA)",
    capacity: 2500,
    usedCapacity: 900,
    temperature: "Controlled",
    humidity: "70%",
    items: 3,
    status: "active",
  },
  {
    id: "5",
    name: "Warehouse 05 - Packing",
    capacity: 3500,
    usedCapacity: 1500,
    temperature: "18°C",
    humidity: "55%",
    items: 7,
    status: "active",
  },
];

const initialProductionOrders: ProductionOrder[] = [
  {
    id: "PO-1001",
    productName: "Assorted Veg Pack",
    productSku: "VEG-PACK-01",
    requiredQuantity: 500,
    producedQuantity: 120,
    stages: [
      { id: "s1", name: "Raw Materials", warehouse: "Warehouse 01 - Raw Materials", status: "completed", startedAt: "2024-01-15 08:00", completedAt: "2024-01-15 09:00" },
      { id: "s2", name: "Washing & Sorting", warehouse: "Warehouse 02 - Washing & Sorting", status: "in-progress", startedAt: "2024-01-15 09:30" },
      { id: "s3", name: "Cutting & Preparation", warehouse: "Warehouse 03 - Cutting & Preparation", status: "pending" },
      { id: "s4", name: "Incubation (QA)", warehouse: "Warehouse 04 - Incubation (QA)", status: "pending" },
      { id: "s5", name: "Packing", warehouse: "Warehouse 05 - Packing", status: "pending" },
    ],
    qa: { rawInspection: true, midProcessAudit: false, prePackCheck: false, finalQC: false },
    status: "in_progress",
  },
  {
    id: "PO-1002",
    productName: "Tomato Puree",
    productSku: "TOM-PUR-02",
    requiredQuantity: 300,
    producedQuantity: 300,
    stages: [
      { id: "s1", name: "Raw Materials", warehouse: "Warehouse 01 - Raw Materials", status: "completed" },
      { id: "s2", name: "Washing & Sorting", warehouse: "Warehouse 02 - Washing & Sorting", status: "completed" },
      { id: "s3", name: "Cutting & Preparation", warehouse: "Warehouse 03 - Cutting & Preparation", status: "completed" },
      { id: "s4", name: "Incubation (QA)", warehouse: "Warehouse 04 - Incubation (QA)", status: "completed" },
      { id: "s5", name: "Packing", warehouse: "Warehouse 05 - Packing", status: "completed" },
    ],
    qa: { rawInspection: true, midProcessAudit: true, prePackCheck: true, finalQC: true },
    status: "ready",
  },
];

export default function Warehouse() {
  const [items, setItems] = useState<WarehouseItem[]>(initialWarehouseItems);
  const [activeTab, setActiveTab] = useState<"dashboard" | "movements" | "zones" | "analytics" | "production">("dashboard");
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showStockMovementModal, setShowStockMovementModal] = useState(false);
  const [showLowStockAlerts, setShowLowStockAlerts] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [batchItems, setBatchItems] = useState(Array.from({ length: 3 }).map((_, idx) => ({
    id: String(idx + 1),
    product: "",
    name: "",
    sku: "",
    category: "",
    quantity: "",
    minStock: "",
    maxStock: "",
    location: "",
    zone: "Warehouse 01 - Raw Materials",
    rack: "",
    shelf: "",
    unit: "",
    unitPrice: "",
    supplier: "",
    batchNo: "",
    rawType: "",
    arrivalDate: "",
    moisture: "",
    ffa: "",
    expiryDate: "",
    temperature: "",
    humidity: "",
    notes: ""
  })));
  const [stockMovement, setStockMovement] = useState({
    itemId: "",
    type: "in" as "in" | "out" | "transfer" | "adjustment",
    quantity: "",
    fromLocation: "",
    toLocation: "",
    reason: "",
    reference: ""
  });
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(initialProductionOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialProductionOrders[0]?.id || "");
  const processes: ProcessPlatform[] = [];
  const [deliveredReports] = useState<DeliveredReportRecord[]>([]);
  const [wastageRecords] = useState<WastageRecord[]>([]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedZoneDetails, setSelectedZoneDetails] = useState<WarehouseZone | null>(null);
  const [lastBatchResult, setLastBatchResult] = useState<{updated: string[]; created: string[]} | null>(null);
  // Manual workflow recording selections
  const [manualOrderId, setManualOrderId] = useState<string>(initialProductionOrders[0]?.id || "");
  const [manualStageId, setManualStageId] = useState<string>(initialProductionOrders[0]?.stages[0]?.id || "");

  const categories = ["All", "Vegetables", "Leafy Greens", "Fruits", "Herbs", "Root Vegetables"];
  const zones = ["All", "Warehouse 01 - Raw Materials", "Warehouse 02 - Washing & Sorting", "Warehouse 03 - Cutting & Preparation", "Warehouse 04 - Incubation (QA)", "Warehouse 05 - Packing"];

  const filteredItems = items;

  const selectedOrder = productionOrders.find(o => o.id === selectedOrderId) || null;

  const canMarkReady = selectedOrder ? (
    selectedOrder.stages.every(s => s.status === "completed") &&
    selectedOrder.qa.rawInspection && selectedOrder.qa.midProcessAudit && selectedOrder.qa.prePackCheck && selectedOrder.qa.finalQC &&
    selectedOrder.status !== "delivered"
  ) : false;

  const deliveredOrders = productionOrders.filter(o => o.status === "delivered");

  // Helper: derive current stage for a process platform (based on first incomplete task)
  const getCurrentProcessStage = (proc: ProcessPlatform): string => {
    if (proc.status === 'delivered') return 'Delivered';
    const firstIncomplete = proc.tasks.find(t => !t.done);
    return firstIncomplete ? firstIncomplete.name : (proc.status === 'ready' ? 'Ready to Deliver' : 'In Progress');
  };

  const handleAdvanceStage = (stageId: string) => {
    setProductionOrders(prev => prev.map(order => {
      if (order.id !== selectedOrderId || order.status === "delivered") return order;
      const updatedStages = order.stages.map(s => {
        if (s.id !== stageId) return s;
        const now = new Date().toISOString().replace('T',' ').substring(0,16);
        if (s.status === "pending") return { ...s, status: "in-progress" as StageStatus, startedAt: now } as ProductionStage;
        if (s.status === "in-progress") return { ...s, status: "completed" as StageStatus, completedAt: now } as ProductionStage;
        return s;
      });
      return { ...order, stages: updatedStages };
    }));
  };

  const handleToggleQA = (field: keyof QualityChecks) => {
    setProductionOrders(prev => prev.map(order => {
      if (order.id !== selectedOrderId || order.status === "delivered") return order;
      return { ...order, qa: { ...order.qa, [field]: !order.qa[field] } };
    }));
  };

  const markReadyToDeliver = () => {
    if (!selectedOrder) return;
    setProductionOrders(prev => prev.map(order => order.id === selectedOrder.id ? { ...order, status: "ready" } : order));
  };

  const markDelivered = () => {
    if (!selectedOrder) return;
    const now = new Date().toISOString().replace('T',' ').substring(0,16);
    setProductionOrders(prev => prev.map(order => order.id === selectedOrder.id ? { ...order, status: "delivered", deliveredAt: now } : order));
  };

  const handleStockMovement = () => {
    const selectedItem = items.find(item => item.id === stockMovement.itemId);
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

  const handleUpdateItem = () => {
    if (!editingItem) return;
    setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
    setShowEditModal(false);
    setEditingItem(null);
  };


  // Removed dashboard task/QA controls in favor of simplified current-stage display

  // Manual workflow recording for Production Orders (start/complete by explicit selection)
  const manualStartStage = (orderId: string, stageId: string) => {
    setProductionOrders(prev => prev.map(order => {
      if (order.id !== orderId || order.status === 'delivered') return order;
      const updatedStages = order.stages.map(s => {
        if (s.id !== stageId) return s;
        if (s.status === 'pending') {
          const now = new Date().toISOString().replace('T',' ').substring(0,16);
          return { ...s, status: 'in-progress' as StageStatus, startedAt: now };
        }
        return s;
      });
      return { ...order, stages: updatedStages };
    }));
  };

  const manualCompleteStage = (orderId: string, stageId: string) => {
    setProductionOrders(prev => prev.map(order => {
      if (order.id !== orderId || order.status === 'delivered') return order;
      const updatedStages = order.stages.map(s => {
        if (s.id !== stageId) return s;
        if (s.status === 'in-progress') {
          const now = new Date().toISOString().replace('T',' ').substring(0,16);
          return { ...s, status: 'completed' as StageStatus, completedAt: now };
        }
        return s;
      });
      return { ...order, stages: updatedStages };
    }));
  };

  // Get low stock alerts
  const lowStockAlerts = items.filter((itm: WarehouseItem) => 
    itm.quantity <= itm.minStock || itm.status === "low-stock"
  );

  const renderZoneContext = (zone: WarehouseZone) => {
    const name = zone.name.toLowerCase();
    if (name.includes('raw materials')) {
      return (
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">Raw Materials Section</h3>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            <li>Receive and register new batches (Add Batch in Warehouse)</li>
            <li>Verify supplier, quantities, temperature and humidity targets</li>
            <li>Move approved lots to Washing & Sorting</li>
          </ul>
        </div>
      );
    }
    if (name.includes('washing') || name.includes('sorting')) {
      return (
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">Washing & Sorting Section</h3>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            <li>Wash materials under 4–6°C chilled water</li>
            <li>Sort by size/quality; discard visibly damaged pieces</li>
            <li>Send accepted lots to Cutting & Preparation</li>
          </ul>
        </div>
      );
    }
    if (name.includes('cutting') || name.includes('preparation')) {
      return (
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">Cutting & Preparation Section</h3>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            <li>Follow standard cut specs and yields</li>
            <li>Maintain tools sanitation schedule</li>
            <li>Stage prepped lots for Incubation (QA)</li>
          </ul>
        </div>
      );
    }
    if (name.includes('incubation')) {
      return (
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">Incubation (QA) Section</h3>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            <li>Perform product quality checks (micro, texture, color)</li>
            <li>If QA <span className="font-medium">Pass</span>: move batch to Packing</li>
            <li>If QA <span className="font-medium">Fail</span>: route batch to Wastage</li>
          </ul>
          <p className="text-xs text-gray-500">You can also simulate this on Dashboard via Incubation QA Pass/Fail.</p>
        </div>
      );
    }
    if (name.includes('packing')) {
      return (
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">Packing Section</h3>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            <li>Pack according to SKU label and net weight</li>
            <li>Seal integrity and date coding verification</li>
            <li>Ready to Deliver → Deliver to generate report</li>
          </ul>
        </div>
      );
    }
    return null;
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
            onClick={() => setShowAddBatchModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={16} />
            Add Batch
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
              <p className="text-2xl font-bold text-blue-600">{items.length}</p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-green-600">{items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}</p>
            </div>
            <Box className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{items.filter(item => item.status === "low-stock").length}</p>
            </div>
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">Rs. {items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}</p>
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
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "movements", label: "Stock Movements", icon: ArrowUpDown },
                             { id: "zones", label: "Warehouse Zones", icon: WarehouseIcon },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "production", label: "Production Workflow", icon: Truck },
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
          {lastBatchResult && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded p-3 text-sm flex items-start justify-between">
              <div>
                <p className="font-medium">Batch processed successfully</p>
                <p>{lastBatchResult.updated.length} updated, {lastBatchResult.created.length} created.</p>
                {(lastBatchResult.updated.length > 0) && (
                  <p className="mt-1">Updated: {lastBatchResult.updated.join(', ')}</p>
                )}
                {(lastBatchResult.created.length > 0) && (
                  <p className="mt-1">Created: {lastBatchResult.created.join(', ')}</p>
                )}
              </div>
              <button className="text-green-700 hover:underline" onClick={()=>setLastBatchResult(null)}>Dismiss</button>
            </div>
          )}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Process Platforms Section */}
              <div className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-xl">Process Platforms</h3>
                  <div className="text-sm text-gray-600">
                    Track products and their current process status across warehouses
                  </div>
                </div>
                
                {processes.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Processes</h4>
                    <p className="text-gray-600 mb-4">Create process platforms for products to track their status across warehouses</p>
                    <button 
                      onClick={() => setActiveTab("production")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Go to Production Workflow
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {processes.map(process => {
                      const currentStage = getCurrentProcessStage(process);
                      const getWarehouseLocation = (stage: string) => {
                        if (stage.includes('Raw Materials')) return 'Warehouse 01 - Raw Materials';
                        if (stage.includes('Washing')) return 'Warehouse 02 - Washing & Sorting';
                        if (stage.includes('Cutting')) return 'Warehouse 03 - Cutting & Preparation';
                        if (stage.includes('Incubation') || stage.includes('QA')) return 'Warehouse 04 - Incubation (QA)';
                        if (stage.includes('Packing')) return 'Warehouse 05 - Packing';
                        return 'Unknown Warehouse';
                      };
                      
                      const warehouseLocation = getWarehouseLocation(currentStage);
                      
                      return (
                        <div key={process.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-900 mb-1">{process.itemName}</h4>
                              <p className="text-sm text-gray-600 mb-2">SKU: {process.itemSku}</p>
                              <p className="text-xs text-gray-500">Process ID: {process.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              process.status === 'delivered' 
                                ? 'bg-green-100 text-green-700' 
                                : process.status === 'ready' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {process.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <WarehouseIcon className="text-blue-600" size={16} />
                              <span className="text-sm font-medium text-gray-700">Current Location:</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">{warehouseLocation}</p>
                            
                            <div className="flex items-center gap-2">
                              <Box className="text-green-600" size={16} />
                              <span className="text-sm font-medium text-gray-700">Current Stage:</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">{currentStage}</p>
                            
                            <div className="flex items-center gap-2">
                              <TrendingUp className="text-purple-600" size={16} />
                              <span className="text-sm font-medium text-gray-700">Progress:</span>
                            </div>
                            <div className="ml-6">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Tasks Completed</span>
                                <span>{process.tasks.filter(t => t.done).length}/{process.tasks.length}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(process.tasks.filter(t => t.done).length / process.tasks.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Created: {new Date(process.createdAt).toLocaleDateString()}</span>
                              {process.deliveredAt && (
                                <span>Delivered: {new Date(process.deliveredAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Delivered Reports Section */}
              <div className="bg-white rounded-lg shadow border p-6">
                <h3 className="font-semibold text-lg mb-4">Delivered Reports</h3>
                {deliveredReports.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-sm text-gray-600">No delivered records yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Process</th>
                          <th className="text-left p-3 text-sm font-medium">Item</th>
                          <th className="text-left p-3 text-sm font-medium">SKU</th>
                          <th className="text-left p-3 text-sm font-medium">Delivered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveredReports.map(r => (
                          <tr key={r.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm font-medium">{r.processId}</td>
                            <td className="p-3 text-sm">{r.itemName}</td>
                            <td className="p-3 text-sm">{r.itemSku}</td>
                            <td className="p-3 text-sm">{r.deliveredAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Wastage Records Section */}
              <div className="bg-white rounded-lg shadow border p-6">
                <h3 className="font-semibold text-lg mb-4">Wastage Records</h3>
                {wastageRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-sm text-gray-600">No wastage recorded.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Process</th>
                          <th className="text-left p-3 text-sm font-medium">Item</th>
                          <th className="text-left p-3 text-sm font-medium">SKU</th>
                          <th className="text-left p-3 text-sm font-medium">Failed At</th>
                          <th className="text-left p-3 text-sm font-medium">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wastageRecords.map(w => (
                          <tr key={w.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm font-medium">{w.processId}</td>
                            <td className="p-3 text-sm">{w.itemName}</td>
                            <td className="p-3 text-sm">{w.itemSku}</td>
                            <td className="p-3 text-sm">{w.failedAt}</td>
                            <td className="p-3 text-sm">{w.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
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
                    <button
                      onClick={() => { setSelectedZoneDetails(zone); setShowZoneModal(true); }}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition"
                    >
                      View
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
                      {items.filter(item => item.status === "in-stock").length} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Stock</span>
                    <span className="font-medium text-yellow-600">
                      {items.filter(item => item.status === "low-stock").length} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Out of Stock</span>
                    <span className="font-medium text-red-600">
                      {items.filter(item => item.status === "out-of-stock").length} items
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

          {activeTab === "production" && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={16} />
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {productionOrders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.productName}</option>
                    ))}
                  </select>
        </div>
                {selectedOrder && (
                  <div className="flex gap-3 text-sm">
                    <span className="px-2 py-1 rounded-full bg-gray-100">SKU: <span className="font-medium">{selectedOrder.productSku}</span></span>
                    <span className="px-2 py-1 rounded-full bg-gray-100">Required: <span className="font-medium">{selectedOrder.requiredQuantity}</span></span>
                    <span className="px-2 py-1 rounded-full bg-gray-100">Produced: <span className="font-medium">{selectedOrder.producedQuantity}</span></span>
                    <span className={`px-2 py-1 rounded-full ${selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' : selectedOrder.status === 'ready' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>Status: {selectedOrder.status.replace('_',' ')}</span>
                  </div>
                )}
      </div>

              {/* Manual workflow recorder */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-lg mb-3">Record Workflow (Manual)</h3>
                <div className="flex flex-col md:flex-row gap-3 md:items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Order</label>
                    <select
                      value={manualOrderId}
                      onChange={(e)=> {
                        const newOrderId = e.target.value;
                        setManualOrderId(newOrderId);
                        const order = productionOrders.find(o => o.id === newOrderId);
                        setManualStageId(order?.stages[0]?.id || '');
                      }}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {productionOrders.map(o => (
                        <option key={o.id} value={o.id}>{o.id} - {o.productName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Stage</label>
                    <select
                      value={manualStageId}
                      onChange={(e)=> setManualStageId(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {(productionOrders.find(o=>o.id===manualOrderId)?.stages || []).map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.status.replace('-', ' ')})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={()=> manualStartStage(manualOrderId, manualStageId)}
                      className="px-3 py-2 border rounded hover:bg-gray-50"
                    >Start</button>
                    <button
                      onClick={()=> manualCompleteStage(manualOrderId, manualStageId)}
                      className="px-3 py-2 border rounded hover:bg-gray-50"
                    >Complete</button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Use this to record each stage one by one manually.</p>
              </div>

              {selectedOrder && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gray-50 rounded-lg border p-4">
                    <h3 className="font-semibold text-lg mb-3">Production Stages</h3>
                    <div className="space-y-3">
                      {selectedOrder.stages.map(stage => (
                        <div key={stage.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{stage.name}</p>
                            <p className="text-xs text-gray-600">Warehouse: {stage.warehouse}</p>
                            <p className="text-xs text-gray-500">
                              {stage.startedAt ? `Started: ${stage.startedAt}` : ''}
                              {stage.completedAt ? `  Completed: ${stage.completedAt}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              stage.status === 'completed' ? 'bg-green-100 text-green-700' :
                              stage.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {stage.status.replace('-', ' ')}
                            </span>
                            <button
                              onClick={() => handleAdvanceStage(stage.id)}
                              disabled={selectedOrder.status === 'delivered' || stage.status === 'completed'}
                              className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                              {stage.status === 'pending' ? 'Start' : stage.status === 'in-progress' ? 'Complete' : 'Done'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg border p-4">
                    <h3 className="font-semibold text-lg mb-3">Quality Checks</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selectedOrder.qa.rawInspection} onChange={() => handleToggleQA('rawInspection')} disabled={selectedOrder.status === 'delivered'} />
                        Raw materials inspection
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selectedOrder.qa.midProcessAudit} onChange={() => handleToggleQA('midProcessAudit')} disabled={selectedOrder.status === 'delivered'} />
                        Mid-process audit
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selectedOrder.qa.prePackCheck} onChange={() => handleToggleQA('prePackCheck')} disabled={selectedOrder.status === 'delivered'} />
                        Pre-pack check
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selectedOrder.qa.finalQC} onChange={() => handleToggleQA('finalQC')} disabled={selectedOrder.status === 'delivered'} />
                        Final QC
                      </label>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      <button
                        onClick={markReadyToDeliver}
                        disabled={!canMarkReady || selectedOrder.status !== 'in_progress'}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Ready to Deliver
                      </button>
                      {selectedOrder.status === 'ready' && (
                        <button
                          onClick={markDelivered}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Deliver
                        </button>
                      )}
                      {selectedOrder.status === 'delivered' && (
                        <p className="text-sm text-gray-600 mt-2">This order has been delivered. Editing is locked.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivered Records */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-lg mb-3">Delivered Records</h3>
                {deliveredOrders.length === 0 ? (
                  <p className="text-sm text-gray-600">No delivered records yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Order</th>
                          <th className="text-left p-3 text-sm font-medium">Product</th>
                          <th className="text-left p-3 text-sm font-medium">Qty (Produced/Required)</th>
                          <th className="text-left p-3 text-sm font-medium">Delivered At</th>
                          <th className="text-left p-3 text-sm font-medium">Stages</th>
                          <th className="text-left p-3 text-sm font-medium">QA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveredOrders.map(o => (
                          <tr key={o.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm font-medium">{o.id}</td>
                            <td className="p-3 text-sm">{o.productName} ({o.productSku})</td>
                            <td className="p-3 text-sm">{o.producedQuantity} / {o.requiredQuantity}</td>
                            <td className="p-3 text-sm">{o.deliveredAt || '-'}</td>
                            <td className="p-3 text-sm">
                              {o.stages.map(s => s.status === 'completed' ? '✓' : '•').join(' ')}
                            </td>
                            <td className="p-3 text-sm">
                              {o.qa.rawInspection && o.qa.midProcessAudit && o.qa.prePackCheck && o.qa.finalQC ? 'All Passed' : 'Pending'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredItems.length === 0 && activeTab === "movements" && (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">No items match your current search criteria.</p>
        </div>
      )}

      {/* Add Batch Modal */}
      {showAddBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                                            <div>
                 <h2 className="text-2xl font-bold text-gray-800">Add New Batch - All Warehouse Zones</h2>
                 <p className="text-sm text-gray-600 mt-1">Universal form for adding batches to any warehouse zone - Raw Materials, Washing & Sorting, Cutting & Preparation, Incubation (QA), or Packing</p>
               </div>
               <button
                 onClick={() => setShowAddBatchModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X size={24} />
               </button>
            </div>

            <div className="space-y-6">
              {batchItems.map((bi, idx) => (
                <div key={bi.id} className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Item {idx + 1}</h3>
                    <button 
                      className="px-3 py-1 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors" 
                      onClick={() => setBatchItems(bs => bs.filter((_, i) => i !== idx))}
                    >
                      Remove Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Product Selection */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={bi.product} 
                        onChange={(e) => setBatchItems(bs => {
                          const copy = [...bs];
                          const p = productCatalog.find(pr => pr.name === e.target.value);
                          copy[idx] = { 
                            ...copy[idx], 
                            product: e.target.value, 
                            name: p?.name || "", 
                            sku: p?.sku || "", 
                            category: p?.category || "", 
                            unit: (p?.unit || bi.unit) as any, 
                            zone: (p?.defaultZone || bi.zone) as any 
                          } as any;
                          return copy;
                        })}
                      >
                        <option value="">Select product</option>
                        {productCatalog.map(p => (<option key={p.sku} value={p.name}>{p.name}</option>))}
                      </select>
                    </div>

                    {/* Batch Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Batch No *</label>
                      <input 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={bi.batchNo} 
                        onChange={(e) => setBatchItems(bs => {
                          const copy = [...bs]; 
                          copy[idx] = {...copy[idx], batchNo: e.target.value}; 
                          return copy;
                        })} 
                        placeholder="Enter batch number"
                      />
                    </div>

                                         {/* Item Type/Description */}
                     <div className="lg:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-2">Item Type/Description *</label>
                       <input 
                         className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                         value={bi.rawType} 
                         onChange={(e) => setBatchItems(bs => {
                           const copy = [...bs]; 
                           copy[idx] = {...copy[idx], rawType: e.target.value}; 
                           return copy;
                         })} 
                         placeholder="e.g., Raw: White Kernel / Processed: Sliced / Packed: 500g bags / QA: Tested samples"
                       />
                     </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input 
                        type="number" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={bi.quantity} 
                        onChange={(e) => setBatchItems(bs => {
                          const copy = [...bs]; 
                          copy[idx] = {...copy[idx], quantity: e.target.value}; 
                          return copy;
                        })} 
                        placeholder="Enter quantity"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={bi.unit} 
                        onChange={(e) => setBatchItems(bs => {
                          const copy = [...bs]; 
                          copy[idx] = {...copy[idx], unit: e.target.value}; 
                          return copy;
                        })}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                        <option value="boxes">boxes</option>
                      </select>
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (Rs.) *</label>
                      <input 
                        type="number" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={bi.unitPrice} 
                        onChange={(e) => setBatchItems(bs => {
                          const copy = [...bs]; 
                          copy[idx] = {...copy[idx], unitPrice: e.target.value}; 
                          return copy;
                        })} 
                        placeholder="Enter price"
                      />
                    </div>

                    {/* Supplier */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                      <input 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={bi.supplier} 
                        onChange={(e) => setBatchItems(bs => {
                          const copy = [...bs]; 
                          copy[idx] = {...copy[idx], supplier: e.target.value}; 
                          return copy;
                        })} 
                        placeholder="Enter supplier name"
                      />
                    </div>

                    {/* Arrival Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Date *</label>
                      <input 
                        type="date" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={bi.arrivalDate} 
                        onChange={(e) => setBatchItems(bs => {
                          const copy = [...bs]; 
                          copy[idx] = {...copy[idx], arrivalDate: e.target.value}; 
                          return copy;
                        })} 
                      />
                    </div>

                                         {/* Zone-specific fields will be rendered here */}
                     {bi.zone && (
                       <div className="lg:col-span-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                         <p className="text-sm text-blue-800 font-medium">
                           📋 Zone-specific fields for <span className="font-semibold">{bi.zone}</span>
                         </p>
                         <p className="text-xs text-blue-600 mt-1">
                           Fill in the relevant information for this warehouse zone
                         </p>
                       </div>
                     )}

                     {bi.zone === "Warehouse 01 - Raw Materials" && (
                       <>
                         {/* Raw Materials Specific Fields */}
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Moisture Content %</label>
                           <input 
                             type="number" 
                             step="0.01"
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.moisture} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], moisture: e.target.value}; 
                               return copy;
                             })} 
                             placeholder="e.g., 12.5"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">FFA Content %</label>
                           <input 
                             type="number" 
                             step="0.01"
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.ffa} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], ffa: e.target.value}; 
                               return copy;
                             })} 
                             placeholder="e.g., 0.8"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
                           <input 
                             type="date" 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.expiryDate || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], expiryDate: e.target.value}; 
                               return copy;
                             })} 
                           />
                         </div>
                       </>
                     )}

                     {bi.zone === "Warehouse 02 - Washing & Sorting" && (
                       <>
                         {/* Washing & Sorting Specific Fields */}
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Washing Temperature (°C)</label>
                           <input 
                             type="number" 
                             step="0.1"
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.temperature || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], temperature: e.target.value}; 
                               return copy;
                             })} 
                             placeholder="e.g., 4.0"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Sorting Grade</label>
                           <select 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.moisture || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], moisture: e.target.value}; 
                               return copy;
                             })}
                           >
                             <option value="">Select grade</option>
                             <option value="Grade A">Grade A (Premium)</option>
                             <option value="Grade B">Grade B (Standard)</option>
                             <option value="Grade C">Grade C (Economy)</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Washing Method</label>
                           <select 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.ffa || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], ffa: e.target.value}; 
                               return copy;
                             })}
                           >
                             <option value="">Select method</option>
                             <option value="Cold Water">Cold Water (4-6°C)</option>
                             <option value="Warm Water">Warm Water (20-25°C)</option>
                             <option value="Chemical Wash">Chemical Wash</option>
                           </select>
                         </div>
                       </>
                     )}

                     {bi.zone === "Warehouse 03 - Cutting & Preparation" && (
                       <>
                         {/* Cutting & Preparation Specific Fields */}
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Cut Size (cm)</label>
                           <input 
                             type="text" 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.moisture || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], moisture: e.target.value}; 
                               return copy;
                             })} 
                             placeholder="e.g., 2cm slices, 1cm cubes"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Processing Yield %</label>
                           <input 
                             type="number" 
                             step="0.1"
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.ffa || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], ffa: e.target.value}; 
                               return copy;
                             })} 
                             placeholder="e.g., 85.5"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Processing Date</label>
                           <input 
                             type="date" 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.expiryDate || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], expiryDate: e.target.value}; 
                               return copy;
                             })} 
                           />
                         </div>
                       </>
                     )}

                     {bi.zone === "Warehouse 04 - Incubation (QA)" && (
                       <>
                         {/* Incubation (QA) Specific Fields */}
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">QA Test Type</label>
                           <select 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.moisture || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], moisture: e.target.value}; 
                               return copy;
                             })}
                           >
                             <option value="">Select test type</option>
                             <option value="Microbiological">Microbiological Test</option>
                             <option value="Chemical">Chemical Analysis</option>
                             <option value="Physical">Physical Properties</option>
                             <option value="Sensory">Sensory Evaluation</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Test Result</label>
                           <select 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.ffa || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], ffa: e.target.value}; 
                               return copy;
                             })}
                           >
                             <option value="">Select result</option>
                             <option value="Pass">Pass</option>
                             <option value="Fail">Fail</option>
                             <option value="Pending">Pending</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Test Date</label>
                           <input 
                             type="date" 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.expiryDate || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], expiryDate: e.target.value}; 
                               return copy;
                             })} 
                           />
                         </div>
                       </>
                     )}

                     {bi.zone === "Warehouse 05 - Packing" && (
                       <>
                         {/* Packing Specific Fields */}
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Package Size</label>
                           <input 
                             type="text" 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.moisture || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], moisture: e.target.value}; 
                               return copy;
                             })} 
                             placeholder="e.g., 500g, 1kg, 250ml"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
                           <select 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.ffa || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], ffa: e.target.value}; 
                               return copy;
                             })}
                           >
                             <option value="">Select package type</option>
                             <option value="Vacuum Pack">Vacuum Pack</option>
                             <option value="Jar">Jar</option>
                             <option value="Bottle">Bottle</option>
                             <option value="Box">Box</option>
                             <option value="Bulk">Bulk Container</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                           <input 
                             type="date" 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.expiryDate || ""} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], expiryDate: e.target.value}; 
                               return copy;
                             })} 
                           />
                         </div>
                       </>
                     )}

                     {/* Show generic quality fields if no zone is selected */}
                     {!bi.zone && (
                       <>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Quality Parameter 1</label>
                           <input 
                             type="text" 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.moisture} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], moisture: e.target.value}; 
                               return copy;
                             })} 
                             placeholder="Select zone first to see specific fields"
                             disabled
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Quality Parameter 2</label>
                           <input 
                             type="text" 
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                             value={bi.ffa} 
                             onChange={(e) => setBatchItems(bs => {
                               const copy = [...bs]; 
                               copy[idx] = {...copy[idx], ffa: e.target.value}; 
                               return copy;
                             })} 
                             placeholder="Select zone first to see specific fields"
                             disabled
                           />
                         </div>
                       </>
                     )}

                                         {/* Zone */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Zone *</label>
                       <select 
                         className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                         value={bi.zone} 
                         onChange={(e) => setBatchItems(bs => {
                           const copy = [...bs]; 
                           // Reset zone-specific fields when zone changes
                           copy[idx] = {
                             ...copy[idx], 
                             zone: e.target.value,
                             moisture: "", // Reset quality parameters
                             ffa: "",      // Reset quality parameters
                             temperature: "", // Reset temperature
                             humidity: "",   // Reset humidity
                             expiryDate: ""   // Reset dates
                           }; 
                           return copy;
                         })}
                       >
                         <option value="">Select warehouse zone</option>
                         {zones.filter(z => z !== "All").map(z => <option key={z} value={z}>{z}</option>)}
                       </select>
                       <p className="text-xs text-gray-500 mt-1">
                         Raw Materials: New supplies | Washing: Cleaned items | Cutting: Processed items | QA: Tested items | Packing: Finished products
                       </p>
                     </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <input 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={bi.location} 
                        onChange={(e) => setBatchItems(bs => {
                          const copy = [...bs]; 
                          copy[idx] = {...copy[idx], location: e.target.value}; 
                          return copy;
                        })} 
                        placeholder="e.g., A-01-01"
                      />
                    </div>

                    {/* Processing Stage/Batch Notes */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Processing Stage/Batch Notes</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={bi.notes || ""} 
                        onChange={(e) => setBatchItems(bs => {
                          const copy = [...bs]; 
                          copy[idx] = {...copy[idx], notes: e.target.value}; 
                          return copy;
                        })} 
                        placeholder="e.g., Raw Materials: Fresh from supplier / Washing: Pre-washed and sorted / Cutting: Standard 2cm slices / QA: Passed microbiological tests / Packing: 500g vacuum sealed bags"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add/Remove Row Buttons */}
              <div className="flex gap-3 justify-center">
                <button 
                  className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg text-base font-medium hover:bg-green-50 transition-colors" 
                  onClick={() => setBatchItems(bs => [...bs, { 
                    ...bs[0], 
                    id: String(Date.now()), 
                    product: "", 
                    name: "", 
                    sku: "", 
                    quantity: "", 
                    unit: bs[0].unit, 
                    unitPrice: "", 
                    supplier: "", 
                    batchNo: "", 
                    rawType: "", 
                    arrivalDate: "", 
                    moisture: "", 
                    ffa: "", 
                    minStock: "", 
                    maxStock: "", 
                    zone: "", 
                    location: "" 
                  }])}
                >
                  + Add Another Item
                </button>
                <button 
                  className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg text-base font-medium hover:bg-red-50 transition-colors" 
                  onClick={() => setBatchItems(bs => bs.length > 1 ? bs.slice(0, -1) : bs)}
                >
                  - Remove Last Item
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  onClick={() => setShowAddBatchModal(false)}
                  className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const cleaned = batchItems.filter(b => b.name && b.sku && b.quantity && b.unitPrice && b.location);
                    if (cleaned.length === 0) { 
                      alert("Please fill at least one valid row."); 
                      return; 
                    }
                    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
                    const computeStatus = (qty: number, min: number) => qty <= 0 ? "out-of-stock" : (qty <= min ? "low-stock" : "in-stock");
                    setItems(prev => {
                      let next = [...prev];
                      let created = 0; 
                      let updated = 0;
                      const updatedNames: string[] = []; 
                      const createdNames: string[] = [];
                      cleaned.forEach(b => {
                        const qty = parseInt(b.quantity);
                        const min = parseInt(b.minStock || "0");
                        const max = parseInt(b.maxStock || b.quantity);
                        const existingIndex = next.findIndex(it => it.sku.trim().toLowerCase() === b.sku.trim().toLowerCase());
                        if (existingIndex >= 0) {
                          const existing = next[existingIndex];
                          const newQty = (existing.quantity || 0) + qty;
                          next[existingIndex] = {
                            ...existing,
                            name: b.name || existing.name,
                            category: (b.category as string) || existing.category,
                            quantity: newQty,
                            minStock: isNaN(min) ? existing.minStock : (min || existing.minStock),
                            maxStock: isNaN(max) ? existing.maxStock : max,
                            location: b.location || existing.location,
                            zone: (b.zone as string) || existing.zone,
                            rack: (b.rack || existing.rack || ""),
                            shelf: (b.shelf || existing.shelf || ""),
                            unit: (b.unit as string) || existing.unit,
                            unitPrice: b.unitPrice ? parseFloat(b.unitPrice) : existing.unitPrice,
                            supplier: b.supplier || existing.supplier,
                            lastUpdated: now,
                            expiryDate: b.expiryDate || existing.expiryDate,
                            temperature: (b as any).temperature || existing.temperature,
                            humidity: (b as any).humidity || existing.humidity,
                            status: computeStatus(newQty, isNaN(min) ? existing.minStock : (min || existing.minStock)),
                            notes: [existing.notes, b.batchNo ? `Batch ${b.batchNo}` : "", b.rawType ? `Raw: ${b.rawType}` : "", b.moisture ? `Moisture ${b.moisture}%` : "", b.ffa ? `FFA ${b.ffa}%` : ""].filter(Boolean).join(" | ") || undefined,
                          };
                          updated += 1;
                          updatedNames.push(next[existingIndex].name);
                        } else {
                          const newId = String(next.length + 1);
                          const newItem: WarehouseItem = {
                            id: newId,
                            name: b.name,
                            sku: b.sku,
                            category: b.category as string,
                            quantity: qty,
                            minStock: isNaN(min) ? 0 : min,
                            maxStock: isNaN(max) ? qty : max,
                            location: b.location,
                            zone: b.zone as string,
                            rack: b.rack || "",
                            shelf: b.shelf || "",
                            unit: b.unit as string,
                            unitPrice: parseFloat(b.unitPrice),
                            supplier: b.supplier || "",
                            lastUpdated: now,
                            expiryDate: b.expiryDate || undefined,
                            temperature: (b as any).temperature || undefined,
                            humidity: (b as any).humidity || undefined,
                            status: computeStatus(qty, isNaN(min) ? 0 : min),
                            condition: "excellent",
                            notes: [b.batchNo ? `Batch ${b.batchNo}` : "", b.rawType ? `Raw: ${b.rawType}` : "", b.moisture ? `Moisture ${b.moisture}%` : "", b.ffa ? `FFA ${b.ffa}%` : ""].filter(Boolean).join(" | ") || undefined,
                          };
                          next.push(newItem);
                          created += 1;
                          createdNames.push(newItem.name);
                        }
                      });
                      setLastBatchResult({ updated: updatedNames, created: createdNames });
                      alert(`Batch processed: ${updated} updated, ${created} created.`);
                      return next;
                    });
                    setShowAddBatchModal(false);
                    setBatchItems(Array.from({ length: 3 }).map((_, idx) => ({
                      id: String(idx + 1), 
                      product: "", 
                      name: "", 
                      sku: "", 
                      category: "", 
                      quantity: "",
                      minStock: "", 
                      maxStock: "", 
                      location: "", 
                      zone: "", 
                      rack: "", 
                      shelf: "",
                      unit: "", 
                      unitPrice: "", 
                      supplier: "", 
                      batchNo: "", 
                      rawType: "", 
                      arrivalDate: "", 
                      moisture: "", 
                      ffa: "",
                      expiryDate: "", 
                      temperature: "", 
                      humidity: "", 
                      notes: ""
                    })));
                  }}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-base font-medium"
                >
                  Add Batch
                </button>
              </div>
                </div>
                </div>
              </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Item: {editingItem.name}</h2>
              <button onClick={() => { setShowEditModal(false); setEditingItem(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
                </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className="w-full border rounded px-3 py-2" value={editingItem.name} onChange={(e)=>setEditingItem({...editingItem, name: e.target.value})} />
                </div>
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input className="w-full border rounded px-3 py-2" value={editingItem.sku} onChange={(e)=>setEditingItem({...editingItem, sku: e.target.value})} />
                  </div>
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border rounded px-3 py-2" value={editingItem.category} onChange={(e)=>setEditingItem({...editingItem, category: e.target.value})}>
                  {categories.filter(c=>c!=="All").map(c=>(<option key={c} value={c}>{c}</option>))}
                </select>
                  </div>
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={editingItem.quantity} onChange={(e)=>setEditingItem({...editingItem, quantity: parseInt(e.target.value)})} />
                  </div>
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (Rs.)</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={editingItem.unitPrice} onChange={(e)=>setEditingItem({...editingItem, unitPrice: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select className="w-full border rounded px-3 py-2" value={editingItem.unit} onChange={(e)=>setEditingItem({...editingItem, unit: e.target.value})}>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <select className="w-full border rounded px-3 py-2" value={editingItem.zone} onChange={(e)=>setEditingItem({...editingItem, zone: e.target.value})}>
                  {zones.filter(z=>z!=="All").map(z=>(<option key={z} value={z}>{z}</option>))}
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input className="w-full border rounded px-3 py-2" value={editingItem.location} onChange={(e)=>setEditingItem({...editingItem, location: e.target.value})} />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={editingItem.minStock} onChange={(e)=>setEditingItem({...editingItem, minStock: parseInt(e.target.value)})} />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={editingItem.maxStock} onChange={(e)=>setEditingItem({...editingItem, maxStock: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => { setShowEditModal(false); setEditingItem(null); }} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleUpdateItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Update</button>
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
                  {items.map(item => (
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

      {/* Zone Details Modal */}
      {showZoneModal && selectedZoneDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{selectedZoneDetails.name}</h2>
              <button onClick={() => { setShowZoneModal(false); setSelectedZoneDetails(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Capacity</p>
                <p className="text-lg font-semibold">{selectedZoneDetails.capacity.toLocaleString()} units</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Used Capacity</p>
                <p className="text-lg font-semibold">{selectedZoneDetails.usedCapacity.toLocaleString()} units</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Temperature</p>
                <p className="text-lg font-semibold">{selectedZoneDetails.temperature}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Humidity</p>
                <p className="text-lg font-semibold">{selectedZoneDetails.humidity}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Items Tracked</p>
                <p className="text-lg font-semibold">{selectedZoneDetails.items}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-lg font-semibold capitalize">{selectedZoneDetails.status}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Capacity Usage</span>
                <span className="font-medium">{Math.round((selectedZoneDetails.usedCapacity / selectedZoneDetails.capacity) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-600" style={{ width: `${(selectedZoneDetails.usedCapacity / selectedZoneDetails.capacity) * 100}%` }} />
              </div>
            </div>
            {renderZoneContext(selectedZoneDetails)}
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button onClick={() => { setShowZoneModal(false); setSelectedZoneDetails(null); }} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
