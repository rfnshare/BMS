import api from "./apiClient";

export const ExpenseService = {
  // 1. List Expenses
  list: async (params: any = {}) => {
    const response = await api.get("/expenses/", { params });
    return response.data;
  },

  // 2. Create (Handles File Upload)
  create: async (data: any) => {
    if (data.attachment instanceof File) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== "") {
                formData.append(key, data[key]);
            }
        });
        const response = await api.post("/expenses/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } else {
        const response = await api.post("/expenses/", data);
        return response.data;
    }
  },

  // 3. Update (Handles File Upload)
  update: async (id: number, data: any) => {
    if (data.attachment instanceof File) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== "") {
                formData.append(key, data[key]);
            }
        });
        const response = await api.put(`/expenses/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } else {
        const response = await api.put(`/expenses/${id}/`, data);
        return response.data;
    }
  },

  // 4. Delete
  destroy: async (id: number) => {
    await api.delete(`/expenses/${id}/`);
  },

  // 5. Helpers
  // 🔥 FETCH ACTIVE LEASES (Contains Renter & Unit IDs)
  getActiveLeases: async () => {
    const response = await api.get("/leases/leases/", { params: { status: "active", page_size: 100 } });
    return response.data.results;
  },

  // Helpers to resolve names for the dropdown
  getRenter: (id: number) => api.get(`/renters/${id}/`).then(res => res.data),
  getUnit: (id: number) => api.get(`/buildings/units/${id}/`).then(res => res.data),

  // 6. Categories
  getCategories: () => [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'utility', label: 'Utility' },
    { value: 'repair', label: 'Repair' },
    { value: 'other', label: 'Other' },
  ]
};