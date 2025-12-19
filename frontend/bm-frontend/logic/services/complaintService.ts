import api from "./apiClient";

export const ComplaintService = {
  list: async (params: any = {}) => {
    const response = await api.get("/complaints/", { params });
    return response.data;
  },
    getRenterActiveLease: async () => {
    const response = await api.get("/leases/leases/", { params: { is_active: true } });
    return response.data.results[0]; // Returns the primary active lease
  },
  create: async (data: any) => {
    // Handle File Upload
    if (data.attachment instanceof File) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== "") {
                formData.append(key, data[key]);
            }
        });
        const response = await api.post("/complaints/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } else {
        const response = await api.post("/complaints/", data);
        return response.data;
    }
  },

  update: async (id: number, data: any) => {
    if (data.attachment instanceof File) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== "") {
                formData.append(key, data[key]);
            }
        });
        const response = await api.put(`/complaints/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } else {
        const response = await api.put(`/complaints/${id}/`, data);
        return response.data;
    }
  },

  destroy: async (id: number) => {
    await api.delete(`/complaints/${id}/`);
  },

  // Helper for Dropdowns
  getActiveLeases: async () => {
    const response = await api.get("/leases/leases/", { params: { status: "active", page_size: 100 } });
    return response.data.results;
  },

  // Need names for the dropdown
  getRenter: (id: number) => api.get(`/renters/${id}/`).then(res => res.data),
  getUnit: (id: number) => api.get(`/buildings/units/${id}/`).then(res => res.data),
};