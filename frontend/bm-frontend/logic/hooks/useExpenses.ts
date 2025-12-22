import { useState, useEffect, useCallback } from "react";
import {ExpenseService} from "../services/expenseService";
import {getErrorMessage} from "../utils/getErrorMessage";
export function useExpenses(initialFilters: any) {
  const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ExpenseService.list(filters);
      setData(res);
    } catch (err: any) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    data,
    loading,
    filters,
    setFilters,
    refresh: loadExpenses,
  };
}