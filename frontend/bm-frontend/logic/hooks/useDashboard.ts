import { useState, useEffect, useCallback } from "react";
import api from "../services/apiClient";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useNotify } from "../context/NotificationContext";

export function useDashboard() {
  const { error } = useNotify();
  const [data, setData] = useState<any>(null);
  const [topDues, setTopDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, topDuesRes] = await Promise.all([
        api.get("/dashboard/summary/"),
        api.get("/reports/renter/top-dues/")
      ]);
      setData(summaryRes.data.data);
      setTopDues(topDuesRes.data);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    topDues,
    loading,
    actions: { refresh: loadDashboard }
  };
}