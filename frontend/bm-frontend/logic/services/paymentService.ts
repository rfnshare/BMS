// logic/services/paymentService.ts
import api from "./apiClient";

export const PaymentService = {
  list: (params?: any) => api.get("/payments/", { params }).then(res => res.data),
};