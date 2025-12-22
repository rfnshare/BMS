// logic/hooks/useLeaseFinancials.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/apiClient";
import { useNotify } from "../context/NotificationContext";
import { getErrorMessage } from "../utils/getErrorMessage";

export function useLeaseFinancials(leaseId: number) {
  const { error: notifyError } = useNotify();
  const [data, setData] = useState({ invoices: [], payments: [], expenses: [] });
  const [loading, setLoading] = useState(true);

  const fetchFinancials = useCallback(async () => {
    if (!leaseId) return;
    setLoading(true);
    try {
      const [invRes, payRes, expRes] = await Promise.all([
        api.get(`/invoices/?lease=${leaseId}`).then(r => r.data),
        api.get(`/payments/?lease=${leaseId}`).then(r => r.data),
        api.get(`/expenses/?lease=${leaseId}`).then(r => r.data)
      ]);

      setData({
        invoices: invRes.results || invRes || [],
        payments: payRes.results || payRes || [],
        expenses: expRes.results || expRes || []
      });
    } catch (err) {
      notifyError("Financial Audit: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [leaseId, notifyError]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  // Pre-calculate stats for the KPI cards
  const stats = useMemo(() => {
    const totalBilled = data.invoices.reduce((acc, inv: any) => acc + Number(inv.amount), 0);
    const totalPaid = data.payments.reduce((acc, pay: any) => acc + Number(pay.amount), 0);
    const totalExpenses = data.expenses.reduce((acc, exp: any) => acc + Number(exp.amount), 0);
    return { totalBilled, totalPaid, totalExpenses };
  }, [data]);

  return { ...data, stats, loading, refresh: fetchFinancials };
}