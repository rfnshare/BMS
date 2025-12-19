import api from "./apiClient";

export interface Renter {
    id: number;
    full_name: string;
    email?: string;
    phone_number: string;
    alternate_phone?: string;
    date_of_birth?: string;
    gender?: "male" | "female" | "other";
    marital_status: "single" | "married" | "divorced" | "widowed";
    spouse_name?: string;
    spouse_phone?: string;
    nationality?: string;
    status: "prospective" | "active" | "former";

    present_address: string;
    permanent_address: string;

    previous_address?: string;
    from_date?: string;
    to_date?: string;
    landlord_name?: string;
    landlord_phone?: string;
    reason_for_leaving?: string;

    emergency_contact_name?: string;
    relation?: string;
    emergency_contact_phone?: string;

    occupation?: string;
    company?: string;
    office_address?: string;
    monthly_income?: number;

    notification_preference: "none" | "email" | "whatsapp" | "both";

    profile_pic?: string;
    nid_scan?: string;
}

export const RenterService = {
    list: (params?: any) =>
        api.get("/renters/", {params}).then(r => r.data),

    get: (id: number) =>
        api.get(`/renters/${id}/`).then(r => r.data),

    create: (data: FormData) =>
        api.post("/renters/", data, {
            headers: {"Content-Type": "multipart/form-data"},
        }),

    update: (id: number, data: FormData) =>
        api.put(`/renters/${id}/`, data, {
            headers: {"Content-Type": "multipart/form-data"},
        }),

    destroy: (id: number) =>
        api.delete(`/renters/${id}/`).then(r => r.status === 204),

    getProfile: async () => {
        const response = await api.get("/renters/");
        return response.data.results?.[0] || null;
    },

    updateProfile: async (id: number, data: any) => {
        const response = await api.patch(`/renters/${id}/`, data);
        return response.data;
    },
    listDocuments: (renterId: number) =>
        api.get(`/documents/renter-documents/?renter=${renterId}`).then(r => r.data),

    uploadDocument: (formData: FormData) =>
        api.post('/documents/renter-documents/', formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then(r => r.data),

    deleteDocument: (docId: number) =>
        api.delete(`/documents/renter-documents/${docId}/`).then(r => r.status === 204),
};

