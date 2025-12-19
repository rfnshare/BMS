import api from "./apiClient";

export const ReportService = {
  // Financial Endpoints
  getFinancialSummary: () => api.get("/reports/financial/summary/").then(res => res.data),
  getFinancialInvoices: (params: any) => api.get("/reports/financial/invoices/", { params }).then(res => res.data),

  // Occupancy Endpoints
  getOccupancySummary: () => api.get("/reports/occupancy/summary/").then(res => res.data),
  getVacantUnits: (params: any) => api.get("/reports/occupancy/vacant/", { params }).then(res => res.data),

  // Renter Endpoints
  getRenterCollection: () => api.get("/reports/renter/collection/").then(res => res.data),
  getTopDues: () => api.get("/reports/renter/top-dues/").then(res => res.data),
};