import api from "./api";

// Report type for the dashboard
export type Report = {
  id: string;
  title: string;
  category: string;
  date: string;
  fileUrl: string;
  downloadUrl?: string;
  description?: string;
  size?: string;
  lastModified?: string;
  isPlaceholder?: boolean;
};

export const getReportsDashboard = async (): Promise<Report[]> => {
  try {
    const { data } = await api.get<{ reports: Report[] }>("/reports/dashboard");
    return data.reports || [];
  } catch (error) {
    console.error("Error fetching reports:", error);
    // Return fallback data if API fails
    return [
      {
        id: "1",
        title: "Monthly Procurement Summary",
        category: "Procurement",
        date: "2025-01-15",
        fileUrl: "/api/reports/view/1",
        downloadUrl: "/api/reports/download/1",
      },
      {
        id: "2",
        title: "Supplier Performance Report",
        category: "Suppliers",
        date: "2025-01-15",
        fileUrl: "/api/reports/view/2",
        downloadUrl: "/api/reports/download/2",
      },
      {
        id: "3",
        title: "Purchase Order Analysis",
        category: "Orders",
        date: "2025-01-15",
        fileUrl: "/api/reports/view/3",
        downloadUrl: "/api/reports/download/3",
      },
    ];
  }
};


// PDF Generation functions
export const generateProcurementSummaryPDF = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{ success: boolean; downloadUrl?: string; message?: string }> => {
  try {
    const { data } = await api.post("/reports/generate/procurement-summary", params);
    return data as { success: boolean; downloadUrl?: string; message?: string };
  } catch (error) {
    console.error("Error generating procurement summary PDF:", error);
    return { success: false, message: "Failed to generate PDF" };
  }
};

export const generateSupplierPerformancePDF = async (): Promise<{ success: boolean; downloadUrl?: string; message?: string }> => {
  try {
    const { data } = await api.post("/reports/generate/supplier-performance");
    return data as { success: boolean; downloadUrl?: string; message?: string };
  } catch (error) {
    console.error("Error generating supplier performance PDF:", error);
    return { success: false, message: "Failed to generate PDF" };
  }
};

export const generatePurchaseOrdersPDF = async (params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<{ success: boolean; downloadUrl?: string; message?: string }> => {
  try {
    const { data } = await api.post("/reports/generate/purchase-orders", params);
    return data as { success: boolean; downloadUrl?: string; message?: string };
  } catch (error) {
    console.error("Error generating purchase orders PDF:", error);
    return { success: false, message: "Failed to generate PDF" };
  }
};
