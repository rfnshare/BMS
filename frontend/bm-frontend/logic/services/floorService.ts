// logic/services/floorService.ts
import api from './apiClient';

export interface Floor {
  id: number;
  name: string;
  number: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedFloorList {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Floor[];
}

export const FloorService = {
  list: (params?: any) => api.get<PaginatedFloorList>('/buildings/floors/', { params }).then(r => r.data),
  create: (payload: Partial<Floor>) => api.post<Floor>('/buildings/floors/', payload).then(r => r.data),
  retrieve: (id: number) => api.get<Floor>(`/buildings/floors/${id}/`).then(r => r.data),
  update: (id: number, payload: Partial<Floor>) => api.put<Floor>(`/buildings/floors/${id}/`, payload).then(r => r.data),
  partialUpdate: (id: number, payload: any) => api.patch<Floor>(`/buildings/floors/${id}/`, payload).then(r => r.data),
  destroy: (id: number) => api.delete(`/buildings/floors/${id}/`).then(r => r.status === 204),
};
