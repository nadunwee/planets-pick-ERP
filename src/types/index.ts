export type POStatus = "Pending" | "Approved" | "Delivered";

export interface PurchaseOrderItem {
  material: string;
  quantity: number;
  price: number;
}

export interface PurchaseOrder {
  _id?: string;
  poNumber: string; // add this
  supplierId: string;
  supplierName?: string;
  items: {
    material: string;
    quantity: number;
    price: number;
  }[];
  status: "Pending" | "Approved" | "Delivered";
  notes?: string;
  totalAmount?: number; // optional if needed
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
    level?: string;
  };
  approvedBy?: {
    _id: string;
    name: string;
    email?: string;
    level?: string;
  };
  approvedAt?: string;
  approvalNotes?: string;
  deliveredAt?: string;
  invoice?: {
    _id: string;
    invoiceNumber: string;
    status: "Draft" | "Sent" | "Paid" | "Cancelled";
    totalAmount: number;
  };
}

// Backend API payload interface
export interface PurchaseOrderPayload {
  poNumber: string;
  supplier: string;
  items: {
    materialName: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  status: "Pending" | "Approved" | "Delivered";
  notes?: string;
}

export interface InvoiceItem {
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  purchaseOrder?: {
    _id: string;
    poNumber: string;
    status?: string;
    createdBy?: {
      _id: string;
      name: string;
    };
  };
  purchaseOrderId?: string;
  supplier?: {
    _id: string;
    name: string;
    code?: string;
  };
  supplierId?: string;
  supplierName: string;
  supplierCode?: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: "Draft" | "Sent" | "Paid" | "Cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  _id?: string;
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  category?: string;
  status?: "active" | "inactive";
  onTimeDeliveryRate?: number;
  qualityScore?: number;
  responsivenessScore?: number;
  totalSpend?: number;
  ordersCount?: number;
  deleted?: boolean;
}

/** Reports */
export interface SupplierRankingRow {
  supplier: string;
  score: number;
}
export interface SpendingTrendRow {
  month: string;
  spending: number;
}
export interface OrdersBySupplierRow {
  supplier: string;
  orders: number;
  value: number;
}
export interface CycleTimelineRow {
  month: string;
  avgDays: number;
}

export interface ReportsDashboardDTO {
  supplierRanking: SupplierRankingRow[];
  spendingTrends: SpendingTrendRow[];
  ordersBySupplier: OrdersBySupplierRow[];
  cycleTime: CycleTimelineRow[];
}
