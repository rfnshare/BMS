import { useState, useEffect, useCallback } from "react";
import {NotificationService} from "../services/notificationService";
import {getErrorMessage} from "../utils/getErrorMessage";


export function useNotifications(initialFilters: any) {
  const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await NotificationService.list(filters);
      setData(res);
    } catch (err: any) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return { data, loading, filters, setFilters, refresh: loadNotifications };
}