import api from "./apiClient";

export const ProfileService = {
    /**
     * 1. GET Unified Detailed Profile
     * Fetches User data and RenterProfile data in one request.
     */
    getDetailedProfile: async () => {
        const response = await api.get('/accounts/profile/detailed/');
        return response.data;
    },

    /**
     * 2. PATCH Unified Detailed Profile
     * Handles updates for both models using FormData for MultiPart support (images).
     */
    updateDetailedProfile: async (data: any) => {
        const formData = new FormData();

        // 1. Text Fields - Logic to append only if data exists
        if (data.first_name) formData.append("first_name", data.first_name);
        if (data.last_name) formData.append("last_name", data.last_name);
        if (data.phone_number) formData.append("phone_number", data.phone_number);
        if (data.bio) formData.append("bio", data.bio);

        // 2. Profile Picture - Must match the backend 'profile_picture' field name
        if (data.profile_picture instanceof File) {
            formData.append("profile_picture", data.profile_picture);
        }

        const response = await api.patch("/accounts/profile/detailed/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    /**
     * 3. POST Detect Role
     * Used by Topbar to switch dashboards and profile pictures dynamically.
     * Expects: { "phone_or_email": "..." }
     * Returns: { "role": "renter" } or { "role": "admin" }
     */
    detectRole: async (emailOrPhone: string) => {
        const response = await api.post('/accounts/detect-role/', {
            phone_or_email: emailOrPhone
        });
        return response.data;
    },

    // Keeping for backward compatibility
    getMe: async () => {
        const response = await api.get("/accounts/me/");
        return response.data;
    },
};