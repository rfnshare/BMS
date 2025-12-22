import { useState, useEffect, useCallback } from "react";
import { Floor, FloorService } from "../services/floorService";

export function useFloors() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFloors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await FloorService.list();
      // Handling both paginated and non-paginated responses
      setFloors(data.results || data || []);
    } catch (err) {
      console.error("Failed to fetch floors", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFloors();
  }, [loadFloors]);

  const deleteFloor = async (id: number) => {
    if (!confirm("Are you sure? This affects assigned units.")) return;
    try {
      await FloorService.destroy(id);
      await loadFloors();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Unable to delete floor." };
    }
  };

  return {
    floors,
    loading,
    refresh: loadFloors,
    deleteFloor
  };
}