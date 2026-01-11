import api from "./apiClient";

export const InvoiceService = {
    // List with filtering (status, lease, etc.)
    list: async (params = {}) => {
        const response = await api.get("/invoices/", {params});
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
    generateMonthly: async () => {
        // This calls the scheduling endpoint defined in your schema
        const response = await api.post("/scheduling/manual-invoice/");
        return response.data;
    },
    /**
     * 🔥 Manual Rent Reminder
     * Triggers reminders for invoices due in the next 3 days.
     */
    sendManualReminders: async () => {
        const response = await api.post("/scheduling/manual-reminder/");
        return response.data; // Expected: { status: "success", message: "...", details: [] }
    },

    /**
     * 🚨 Manual Overdue Detection
     * Triggers notices for invoices older than 30 days.
     */
    detectOverdueInvoices: async () => {
        const response = await api.post("/scheduling/manual-overdue/");
        return response.data; // Expected: { status: "success", message: "..." }
    },
    resendNotification: async (id: number) => {
        const response = await api.post(`/invoices/${id}/resend_notification/`);
        return response.data;
    },
    // Hydration Helpers
    getLease: (id: number) => api.get(`/leases/leases/${id}/`).then(res => res.data),
    getRenter: (id: number) => api.get(`/renters/${id}/`).then(res => res.data),
    getUnit: (id: number) => api.get(`/buildings/units/${id}/`).then(res => res.data),


};