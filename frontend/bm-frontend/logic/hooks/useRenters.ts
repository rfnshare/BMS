import { useState, useCallback, useEffect } from "react";
import api from "../services/apiClient";
import { useNotify } from "../context/NotificationContext"; // ✅ Your Hook

export function useRenters() {
  const { error } = useNotify(); // ✅ Destructure what you need
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRenters = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/renters/?page=${page}`);
      setRenters(response.data.results || response.data);
    } catch (err) {
      // ✅ Using your logic context
      error("Directory Sync Failed: Connection to property server lost.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { fetchRenters(); }, [fetchRenters]);

  return { renters, loading, actions: { refresh: fetchRenters } };
}