import api from "./apiClient";

export const PaymentService = {
  // 1. List Payments
  list: async (params: any = {}) => {
    const response = await api.get("/payments/", { params });
    return response.data;
  },

  // 2. Create (Single)
  create: async (data: any) => {
    const response = await api.post("/payments/", data);
    return response.data;
  },

  // 3. Create (Bulk)
  createBulk: async (data: any) => {
    const response = await api.post("/payments/bulk/", data);
    return response.data;
  },

  // 4. Update (Edit)
  update: async (id: number, data: any) => {
    const response = await api.put(`/payments/${id}/`, data);
    return response.data;
  },

  // 5. Delete
  destroy: async (id: number) => {
    await api.delete(`/payments/${id}/`);
  },

  // 6. Helpers
  getLease: (id: number) => api.get(`/leases/leases/${id}/`).then(res => res.data),
  getRenter: (id: number) => api.get(`/renters/${id}/`).then(res => res.data),
  getUnit: (id: number) => api.get(`/buildings/units/${id}/`).then(res => res.data),

  // 7. 🔥 FIX: Methods Helper
  getMethods: () => [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'mobile', label: 'Mobile Banking (Bkash/Nagad)' },
    { value: 'card', label: 'Card' },
    { value: 'adjustment', label: 'Security Deposit Adjustment' },
  ]
};