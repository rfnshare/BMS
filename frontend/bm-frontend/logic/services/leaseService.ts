import api from "./apiClient";

export interface Lease {
  id: number;
  renter: number;
  unit: number;
  start_date: string;
  end_date?: string;
  termination_date?: string;
  rent_amount: string;
  security_deposit: string;
  deposit_status: string;
  status: string;
  remarks?: string;

  electricity_card_given: boolean;
  gas_card_given: boolean;
  main_gate_key_given: boolean;
  pocket_gate_key_given: boolean;
  agreement_paper_given: boolean;
  police_verification_done: boolean;
  other_docs_given?: any;
}

export const LeaseService = {
  list: (params?: any) =>
    api.get("/leases/leases/", { params }).then(r => r.data),

  create: (payload: any) =>
    api.post("/leases/leases/", payload).then(r => r.data),

  update: (id: number, payload: any) =>
    api.put(`/leases/leases/${id}/`, payload).then(r => r.data),

  retrieve: (id: number) =>
    api.get(`/leases/leases/${id}/`).then(r => r.data),

  destroy: (id: number) =>
    api.delete(`/leases/leases/${id}/`).then(r => r.status === 204),

  terminate: (id: number) =>
    api.post(`/leases/leases/${id}/terminate/`).then(r => r.data),
    getMyActiveLease: async () => {
    const response = await api.get("/leases/leases/", { params: { is_active: true } });
    return response.data.results[0]; // Returns the current active lease
  },

  // Helper to fetch unit details if not fully expanded in lease
  getUnitDetails: async (id: number) => {
    const response = await api.get(`/units/${id}/`);
    return response.data;
  }
};
