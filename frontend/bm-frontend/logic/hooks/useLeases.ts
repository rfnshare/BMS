// logic/hooks/useLeases.ts
import { useState, useEffect, useCallback } from "react";
import api from "../services/apiClient";
import { LeaseService } from "../services/leaseService";
import { RenterService } from "../services/renterService";
import { UnitService } from "../services/unitService";
import { getErrorMessage } from "../utils/getErrorMessage";

export function useLeases(initialFilters = { status: "", search: "", page: 1 }) {
    const [data, setData] = useState<any>({
        results: [],
        count: 0,
        total_pages: 1,
        current_page: 1
    });
    const [renters, setRenters] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState(initialFilters);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [lRes, rRes, uRes] = await Promise.all([
                LeaseService.list(filters),
                RenterService.list(),
                UnitService.list(),
            ]);

            setData(lRes);
            setRenters(rRes.results || rRes || []);
            setUnits(uRes.results || uRes || []);
        } catch (err) {
            console.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleDelete = async (id: number) => {
        try {
            await LeaseService.destroy(id);
            await refresh();
            return { success: true };
        } catch (err) {
            return { success: false, error: getErrorMessage(err) };
        }
    };

    return { data, renters, units, loading, filters, setFilters, refresh, handleDelete };
}