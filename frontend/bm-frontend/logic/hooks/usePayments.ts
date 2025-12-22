import { useState, useEffect, useCallback } from "react";
import {PaymentService} from "../services/paymentService";
import {getErrorMessage} from "../utils/getErrorMessage";


export function usePayments(initialFilters: any) {
  const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<{ [key: number]: { renter: string; unit: string } }>({});
  const [filters, setFilters] = useState(initialFilters);

  // 1. Hydration Logic: Fetch names for IDs we don't recognize yet
  const hydrateData = useCallback(async (items: any[]) => {
    const uniqueLeaseIds = [...new Set(items.map((i) => i.lease))].filter(Boolean);
    const idsToFetch = uniqueLeaseIds.filter((id) => !cache[id as number]);

    if (idsToFetch.length === 0) return;

    const results = await Promise.all(
      idsToFetch.map(async (leaseId) => {
        try {
          const lease = await PaymentService.getLease(leaseId as number);
          const [renterRes, unitRes] = await Promise.allSettled([
            PaymentService.getRenter(lease.renter),
            PaymentService.getUnit(lease.unit),
          ]);
          return {
            id: leaseId,
            data: {
              renter: renterRes.status === "fulfilled" ? (renterRes.value as any).full_name : "Unknown",
              unit: unitRes.status === "fulfilled" ? (unitRes.value as any).name : "Unknown",
            },
          };
        } catch (e) {
          return { id: leaseId, data: { renter: "Error", unit: "Error" } };
        }
      })
    );

    const updateMap = results.reduce((acc: any, res: any) => {
      if (res) acc[res.id] = res.data;
      return acc;
    }, {});

    setCache((prev) => ({ ...prev, ...updateMap }));
  }, [cache]);

  // 2. Main Loader
  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await PaymentService.list(filters);
      setData(res);
      if (res.results) await hydrateData(res.results);
    } catch (err: any) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filters.method, filters.page, filters.search, filters.lease]);

  return {
    data,
    loading,
    cache,
    filters,
    setFilters,
    refresh: loadPayments,
  };
}