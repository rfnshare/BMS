import api from "./apiClient";

export const NotificationService = {
  // Matches GET /api/notifications/
  // Supported params: page, search, status, channel, notification_type, ordering
  list: async (params: any = {}) => {
    const response = await api.get("/notifications/", { params });
    return response.data;
  },

  // Helpers for Dropdowns based on YAML Enums
  getChannels: () => [
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' }
  ],

  getStatuses: () => [
    { value: 'sent', label: 'Sent' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ],

  getTypes: () => [
    { value: 'invoice_created', label: 'Invoice Generated' },
    { value: 'rent_reminder', label: 'Rent Reminder' },
    { value: 'overdue_notice', label: 'Overdue Notice' }
  ]
};