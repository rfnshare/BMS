import { useState, useEffect, useCallback } from "react";
import {ComplaintService} from "../services/complaintService";
import {getErrorMessage} from "../utils/getErrorMessage";


export function useComplaints(initialFilters: any) {
  const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ComplaintService.list(filters);
      setData(res);
    } catch (err: any) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  return { data, loading, filters, setFilters, refresh: loadComplaints };
}