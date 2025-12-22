// logic/hooks/useRentTypes.ts
import { useState, useEffect, useCallback } from "react";
import { RentType, RentTypeService } from "../services/rentTypeService";
import { getErrorMessage } from "../utils/getErrorMessage";

export function useRentTypes() {
  const [items, setItems] = useState<RentType[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await RentTypeService.list();
      setItems(data.results || data || []);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (id: number) => {
    try {
      await RentTypeService.destroy(id);
      await refresh();
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  return { items, loading, refresh, handleDelete };
}