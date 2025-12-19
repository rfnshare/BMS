import api from "./apiClient";

export const InvoiceService = {
  // List with filtering (status, lease, etc.)
  list: async (params = {}) => {
    const response = await api.get("/invoices/", { params });
    return response.data;
  },

  // Create new invoice
  create: async (data: any) => {
    const response = await api.post("/invoices/", data);
    return response.data;
  },

  // Update existing invoice
  update: async (id: number, data: any) => {
    const response = await api.put(`/invoices/${id}/`, data);
    return response.data;
  },

  // Partial update (e.g., just changing status)
  patch: async (id: number, data: any) => {
    const response = await api.patch(`/invoices/${id}/`, data);
    return response.data;
  },

  // Delete
  destroy: async (id: number) => {
    await api.delete(`/invoices/${id}/`);
  },

  // 🔥 Trigger PDF Generation
  generatePdf: async (id: number) => {
    const response = await api.post(`/invoices/${id}/generate_pdf/`);
    return response.data; // Returns { pdf: "url_to_file" }
  },
    // Hydration Helpers
  getLease: (id: number) => api.get(`/leases/leases/${id}/`).then(res => res.data),
  getRenter: (id: number) => api.get(`/renters/${id}/`).then(res => res.data),
  getUnit: (id: number) => api.get(`/buildings/units/${id}/`).then(res => res.data),

};