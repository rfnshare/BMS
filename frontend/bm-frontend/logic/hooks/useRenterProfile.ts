import {useNotify} from "../context/NotificationContext";
import {useCallback, useEffect, useState} from "react";
import api from "../services/apiClient";

export function useRenterProfile(id: string | string[] | undefined) {
  const { error, notify } = useNotify();
  const [renter, setRenter] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/renters/${id}/`);
      setRenter(res.data);
      // Optional: notify("Profile loaded", "info");
    } catch (err) {
      error("Dossier Error: Renter record is corrupted or missing.");
    } finally {
      setLoading(false);
    }
  }, [id, error]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  return { renter, loading };
}