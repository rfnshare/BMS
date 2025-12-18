// logic/services/invoiceService.ts
import api from "./apiClient";

export const InvoiceService = {
  list: (params?: any) => api.get("/invoices/", { params }).then(res => res.data),
};
