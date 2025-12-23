import api from "./apiClient";

export const ProfileService = {

    getDetailedProfile: async () => {
        const response = await api.get('/accounts/profile/detailed/');
        return response.data;
    },

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