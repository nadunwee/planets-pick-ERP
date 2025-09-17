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
export interface SupplierRankingRow { supplier: string; score: number; }
export interface SpendingTrendRow { month: string; spending: number; }
export interface OrdersBySupplierRow { supplier: string; orders: number; value: number; }
export interface CycleTimelineRow { month: string; avgDays: number; }

export interface ReportsDashboardDTO {
  supplierRanking: SupplierRankingRow[];
  spendingTrends: SpendingTrendRow[];
  ordersBySupplier: OrdersBySupplierRow[];
  cycleTime: CycleTimelineRow[];
}
