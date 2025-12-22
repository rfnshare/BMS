import { useState, useEffect, useCallback } from "react";
import {PermissionService} from "../services/permissionService";
import api from "../services/apiClient";
import {getErrorMessage} from "../utils/getErrorMessage";

export function usePermissions() {
  const [rules, setRules] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
        const [rulesRes, staffRes] = await Promise.all([
            PermissionService.list(),
            api.get("/accounts/staff/")
        ]);

      setRules(rulesRes.results || []);
      setAllStaff(staffRes.data || []);
    } catch (err: any) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { rules, allStaff, loading, refresh: loadData };
}