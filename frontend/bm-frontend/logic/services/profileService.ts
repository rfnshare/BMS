import api from "./apiClient";

export const ProfileService = {
  // Fetches the authenticated user's core account details
  getMe: async () => {
    const response = await api.get("/accounts/me/");
    return response.data;
  },

  // If the user is a renter, fetches their specific profile details
  getRenterMe: async () => {
    const response = await api.get("/renters/me/");
    return response.data;
  },

  // Updates the renter's profile (supports multipart/form-data for profile pics/NID)
  updateRenterMe: async (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.patch("/renters/me/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
};