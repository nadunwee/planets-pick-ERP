import api from "./api";

// Types for procurement reports
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SupplierRankingWeights {
  wOnTime?: number;
  wQuality?: number;
  wResponse?: number;
}

export interface SupplierRankingData {
  supplier: {
    _id: string;
    name: string;
    code: string;
    category: string;
    status: string;
  };
  metrics: {
    onTimeRate: number;
    qualityScore: number;
    responseScore: number;
    weightedScore: number;
    totalSpend: number;
    orderCount: number;
    avgOrderValue: number;
  };
}

export interface SpendingAnalyticsData {
  summary: {
    totalSpend: number;
    totalOrders: number;
    avgOrderValue: number;
    dateRange: DateRange;
  };
  spendingTrends: Array<{
    period: string;
    amount: number;
  }>;
  topSuppliers: Array<{
    supplier: {
      _id: string;
      name: string;
      code: string;
      category: string;
    };
    totalSpend: number;
    orderCount: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
  }>;
}

export interface OrdersBySupplierData {
  supplier: {
    _id: string;
    name: string;
    code: string;
    category: string;
  };
  metrics: {
    totalOrders: number;
    totalValue: number;
    avgOrderValue: number;
    statusBreakdown: Record<string, number>;
  };
}

export interface ProcurementCycleData {
  cycleData: Array<{
    orderId: string;
    supplier: {
      _id: string;
      name: string;
      code: string;
    };
    status: string;
    cycleTime: number;
    createdAt: string;
    updatedAt: string;
  }>;
  statistics: {
    avgCycleTime: number;
    minCycleTime: number;
    maxCycleTime: number;
    totalOrders: number;
  };
  statusBreakdown: Record<string, {
    count: number;
    avgCycleTime: number;
    totalCycleTime: number;
  }>;
}

export interface ProcurementReport {
  _id: string;
  reportType: string;
  title: string;
  description: string;
  generatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  data: any;
  status: string;
  metadata: {
    totalRecords: number;
    generationTime: number;
    fileSize: number;
  };
  createdAt: string;
  updatedAt: string;
}

// API Functions
export const generateSupplierRanking = async (
  dateRange: DateRange,
  weights?: SupplierRankingWeights
): Promise<{ success: boolean; report: { id: string; title: string; data: { rankings: SupplierRankingData[] }; generatedAt: string } }> => {
  const { data } = await api.post("/procurement-reports/supplier-ranking", {
    ...dateRange,
    weights
  });
  return data;
};

export const generateSpendingAnalytics = async (
  dateRange: DateRange,
  groupBy: 'month' | 'year' = 'month'
): Promise<{ success: boolean; report: { id: string; title: string; data: SpendingAnalyticsData; generatedAt: string } }> => {
  const { data } = await api.post("/procurement-reports/spending-analytics", {
    ...dateRange,
    groupBy
  });
  return data;
};

export const generateOrdersBySupplier = async (
  dateRange: DateRange
): Promise<{ success: boolean; report: { id: string; title: string; data: { ordersBySupplier: OrdersBySupplierData[] }; generatedAt: string } }> => {
  const { data } = await api.post("/procurement-reports/orders-by-supplier", dateRange);
  return data;
};

export const generateProcurementCycle = async (
  dateRange: DateRange
): Promise<{ success: boolean; report: { id: string; title: string; data: ProcurementCycleData; generatedAt: string } }> => {
  const { data } = await api.post("/procurement-reports/procurement-cycle", dateRange);
  return data;
};

export const getProcurementReports = async (params?: {
  page?: number;
  limit?: number;
  reportType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ success: boolean; reports: ProcurementReport[]; pagination: { current: number; pages: number; total: number } }> => {
  const { data } = await api.get("/procurement-reports", { params });
  return data;
};

export const getProcurementReport = async (id: string): Promise<{ success: boolean; report: ProcurementReport }> => {
  const { data } = await api.get(`/procurement-reports/${id}`);
  return data;
};

export const deleteProcurementReport = async (id: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/procurement-reports/${id}`);
  return data;
};
