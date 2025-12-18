import api from "./apiClient";

export interface RentType {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

export const RentTypeService = {
  list: () => api.get("/leases/rent-types/").then(r => r.data),
  create: (data: Partial<RentType>) =>
    api.post("/leases/rent-types/", data).then(r => r.data),
  update: (id: number, data: Partial<RentType>) =>
    api.put(`/leases/rent-types/${id}/`, data).then(r => r.data),
  destroy: (id: number) =>
    api.delete(`/leases/rent-types/${id}/`).then(r => r.status === 204),
};
