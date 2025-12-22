import { useState, useEffect, useCallback } from "react";
import { Floor, FloorService } from "../services/floorService";
import { useNotify } from "../context/NotificationContext"; // ✅ Added

export function useFloors() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useNotify(); // ✅ Initialize notifications

  const loadFloors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await FloorService.list();
      setFloors(data.results || data || []);
    } catch (err) {
      error("Could not load floors from server.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadFloors();
  }, [loadFloors]);

  // ✅ Updated Delete Logic with Notifications
  const deleteFloor = async (id: number) => {
    // 1. Ask for confirmation (browser default is fine here)
    if (!confirm("Are you sure? This will affect all units assigned to this floor.")) return;

    try {
      await FloorService.destroy(id);

      // 2. Show Success Toast
      success("Floor deleted successfully.");

      // 3. Refresh the list
      await loadFloors();
    } catch (err: any) {
      // 4. Show Error Toast if delete fails (e.g., floor has active units)
      error("Unable to delete floor. It may have units assigned to it.");
    }
  };

  return {
    floors,
    loading,
    refresh: loadFloors,
    deleteFloor
  };
}