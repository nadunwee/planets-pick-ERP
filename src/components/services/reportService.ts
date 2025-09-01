import api from "./api";
import type { ReportsDashboardDTO } from "../../types";

export const getReportsDashboard = async (): Promise<ReportsDashboardDTO> => {
  const { data } = await api.get<ReportsDashboardDTO>("/reports/dashboard");
  return data;
};


// If your backend uses multiple endpoints instead, you can add more funcs:
// - /suppliers/rankings
// - /reports/spending-analytics
// - /reports/orders-by-supplier
// - /reports/procurement-cycle
