// logic/services/unitService.ts
import api from './apiClient';

export type StatusEnum = 'vacant' | 'occupied' | 'maintenance';
export type UnitType = 'residential' | 'shop';

export interface Unit {
  id: number;
  floor: number;
  name?: string;
  unit_number?: string; // if present in your backend
  unit_type: UnitType;
  status: StatusEnum;
  monthly_rent?: string | null;
  security_deposit?: string | null;
  remarks?: string | null;
  documents?: UnitDocument[];
}

export interface UnitDocument {
  id: number;
  unit: number;
  doc_type: string;
  file: string;
  uploaded_at: string;
}

export interface PaginatedUnitList { count: number; results: Unit[]; next?: string; previous?: string; }

export const UnitService = {
  list: async (page: number = 1) => {
    const response = await api.get(`/buildings/units/?page=${page}`);
    return response.data;
  },
  create: (payload: any) => api.post<Unit>('/buildings/units/', payload).then(r => r.data),
  retrieve: (id: number) => api.get<Unit>(`/buildings/units/${id}/`).then(r => r.data),
  update: (id: number, payload: any) => api.put<Unit>(`/buildings/units/${id}/`, payload).then(r => r.data),
  partialUpdate: (id: number, payload: any) => api.patch<Unit>(`/buildings/units/${id}/`, payload).then(r => r.data),
  destroy: (id: number) => api.delete(`/buildings/units/${id}/`).then(r => r.status === 204),

  // Document endpoints (unit-specific)
  uploadDocument: (unitId: number, formData: FormData) =>
    api.post(`/buildings/units/${unitId}/upload_document/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),

  updateDocument: (unitId: number, docId: number, formData: FormData) =>
    api.put(`/buildings/units/${unitId}/update_document/${docId}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),

  deleteDocument: (unitId: number, docId: number) =>
    api.delete(`/buildings/units/${unitId}/delete_document/${docId}/`).then(r => r.status === 204),

  // Unit-documents collection endpoints
  listDocuments: (params?: any) => api.get('/unit-documents/', { params }).then(r => r.data),
  retrieveDocument: (id: number) => api.get(`/unit-documents/${id}/`).then(r => r.data),

};
