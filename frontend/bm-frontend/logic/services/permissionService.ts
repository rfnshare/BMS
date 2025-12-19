import api from "./apiClient";

export const PermissionService = {
  // List all permission rules
  list: async (params: any = {}) => {
    const response = await api.get("/permissions/app-permissions/", { params });
    return response.data;
  },

  // Create a new permission rule
  create: async (data: any) => {
    const response = await api.post("/permissions/app-permissions/", data);
    return response.data;
  },

  // Update a rule
  update: async (id: number, data: any) => {
    const response = await api.put(`/permissions/app-permissions/${id}/`, data);
    return response.data;
  },

  // Delete a rule
  destroy: async (id: number) => {
    await api.delete(`/permissions/app-permissions/${id}/`);
  },

  // Helper to fetch Users (to assign to permissions)
  getUsers: async () => {
    const response = await api.get("/accounts/me/"); // Adjust if you have a user list API
    return response.data;
  }
};