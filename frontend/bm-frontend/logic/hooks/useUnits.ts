// logic/hooks/useUnits.ts
import { useState, useEffect, useCallback } from "react";
import { Unit, UnitService } from "../services/unitService";
import { Floor, FloorService } from "../services/floorService";

export const useUnits = (initialPage: number = 1) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Stats States
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

      // We are getting all floors at once as per your code
      setFloors(floorRes.results || floorRes || []);

      // Calculate stats
      setStats({
        vacant: unitsData.filter((u: any) => u.status === 'vacant').length,
        occupied: unitsData.filter((u: any) => u.status === 'occupied').length
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state with API on page change
  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  const deleteUnit = async (id: number) => {
    try {
      await UnitService.destroy(id);
      await loadData(currentPage); // Refresh current page
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const getUnitDetail = async (id: number) => {
    try {
      return await UnitService.retrieve(id);
    } catch (err) {
      throw err;
    }
  };

  // Return exactly what the UI needs to function
  return {
    units,
    floors,
    loading,
    pagination: {
      currentPage,
      setCurrentPage,
      totalCount,
      totalPages
    },
    stats,
    actions: {
      refresh: () => loadData(currentPage),
      deleteUnit,
      getUnitDetail
    }
  };
};