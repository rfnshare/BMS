import { useState, useEffect, useCallback } from "react";
import { Unit, UnitService } from "../services/unitService";
import { Floor, FloorService } from "../services/floorService";
import { useNotify } from "../context/NotificationContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import api from "../services/apiClient";

export const useUnits = (initialPage: number = 1) => {
  const { success, error: notifyError } = useNotify();

  const [units, setUnits] = useState<Unit[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination & Stats
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ vacant: 0, occupied: 0 });

  const loadData = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const [unitRes, floorRes] = await Promise.all([
        UnitService.list(page),
        FloorService.list()
      ]);

      const unitsData = unitRes.results || [];
      setUnits(unitsData);
      setTotalCount(unitRes.count || 0);
      setTotalPages(unitRes.total_pages || 1);
      setFloors(floorRes.results || floorRes || []);

      setStats({
        vacant: unitsData.filter((u: any) => u.status === 'vacant').length,
        occupied: unitsData.filter((u: any) => u.status === 'occupied').length
      });
    } catch (err) {
      notifyError("Failed to synchronize unit data.");
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => { loadData(currentPage); }, [currentPage, loadData]);

  // Actions
  const deleteUnit = async (id: number) => {
    if (!confirm("Delete unit? This action cannot be undone.")) return { success: false };
    try {
      await UnitService.destroy(id);
      success("Unit deleted successfully.");
      await loadData(currentPage);
      return { success: true };
    } catch (err: any) {
      notifyError("Delete failed. Check for active leases.");
      return { success: false };
    }
  };

  const getUnitDetail = async (id: number) => {
    try {
      return await UnitService.retrieve(id);
    } catch (err) {
      notifyError("Error loading unit details.");
      throw err;
    }
  };

  return {
    units, floors, loading, stats,
    pagination: { currentPage, setCurrentPage, totalCount, totalPages },
    actions: { refresh: () => loadData(currentPage), deleteUnit, getUnitDetail }
  };
};