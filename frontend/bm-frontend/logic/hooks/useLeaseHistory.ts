// logic/hooks/useLeaseHistory.ts
import { useState, useEffect, useCallback } from "react";
import api from "../services/apiClient";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useNotify } from "../context/NotificationContext";

export function useLeaseHistory(leaseId: number) {
  const { error: notifyError } = useNotify();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!leaseId) return;
    setLoading(true);
    try {
      const res = await api.get("/leases/lease-rent-history/", {
        params: { lease: leaseId },
      });
      const data = res.data.results || res.data;
      // Chronological sort: Newest changes at the top
      setHistory(data.sort((a: any, b: any) =>
        new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
      ));
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [leaseId, notifyError]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading };
}