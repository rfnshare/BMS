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
    getRenterProfile: async () => {
        const response = await api.get("/renters/me/");
        return response.data; // Returns RenterProfileSerializer data
    },

    updateRenterProfile: async (data: any) => {
        const formData = new FormData();
        // Append fields allowed by RenterProfileSerializer
        if (data.full_name) formData.append("full_name", data.full_name);
        if (data.phone_number) formData.append("phone_number", data.phone_number);
        if (data.notification_preference) formData.append("notification_preference", data.notification_preference);

        // Handle profile picture file upload
        if (data.profile_pic instanceof File) {
            formData.append("profile_pic", data.profile_pic);
        }

        const response = await api.patch("/renters/me/", formData, {
            headers: {"Content-Type": "multipart/form-data"},
        });
        return response.data;
    }
};