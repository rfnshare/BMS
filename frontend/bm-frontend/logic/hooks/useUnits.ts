import { useState, useEffect, useCallback } from "react";
import api from "../services/apiClient";
import { useNotify } from "../context/NotificationContext";
import { getErrorMessage } from "../utils/getErrorMessage";

export interface UnitFilters {
  search: string;
  status: "" | "vacant" | "occupied" | "maintenance";
  unit_type: "" | "residential" | "shop";
  floor?: number;
  page: number;
}

export const useUnits = (initialPage: number = 1) => {
  const { success, error: notifyError } = useNotify();

  const [units, setUnits] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<UnitFilters>({
    search: "",
    status: "",
    unit_type: "",
    floor: undefined,
    page: initialPage
  });

  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1 });
  const [stats, setStats] = useState({ vacant: 0, occupied: 0 });

  // 1. Fixed Paths: Added '/api/' to match OpenAPI spec
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, uRes] = await Promise.all([
        api.get("/buildings/floors/?page_size=100"), //
        api.get("/buildings/units/", { params: filters }) //
      ]);

      const unitResults = uRes.data?.results || [];
      setUnits(unitResults);
      setFloors(fRes.data?.results || []);
      setPagination({
        totalCount: uRes.data?.count || 0,
        totalPages: uRes.data?.total_pages || 1
      });

      setStats({
        vacant: unitResults.filter((u: any) => u.status === 'vacant').length,
        occupied: unitResults.filter((u: any) => u.status === 'occupied').length
      });
    } catch (err) {
      notifyError("Sync Error: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, notifyError]);

  useEffect(() => { loadData(); }, [loadData]);

  // 2. Delete Logic: Explicit ID check and refresh
  const deleteUnit = async (id: number) => {
    if (!id) return;
    if (!window.confirm("⚠️ Permanent delete this unit asset?")) return;

    setLoading(true);
    try {
      await api.delete(`/buildings/units/${id}/`);
      success("Unit removed successfully.");
      await loadData(); // Force refresh the list after deletion
    } catch (err) {
      notifyError("Action Denied: This unit is linked to active lease records.");
    } finally {
      setLoading(false);
    }
  };

  return {
    units, floors, loading, stats, filters, setFilters,
    pagination: { ...pagination, currentPage: filters.page },
    actions: { refresh: loadData, deleteUnit }
  };
};