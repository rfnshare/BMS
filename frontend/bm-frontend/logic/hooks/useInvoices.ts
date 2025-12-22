import { useState, useEffect, useCallback } from "react";
import { InvoiceService } from "../services/invoiceService";
import { useNotify } from "../context/NotificationContext";

export function useInvoices(filters: any) {
  const { error, success } = useNotify();
  const [data, setData] = useState<any>({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cache, setCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});

  // 🧠 Hydration Logic: Cache renter/unit details to avoid redundant API hits
  const hydrateData = useCallback(async (invoices: any[]) => {
    const uniqueLeaseIds = [...new Set(invoices.map(inv => inv.lease))]
      .filter(id => id && !cache[id as number]);

    if (uniqueLeaseIds.length === 0) return;

    const results = await Promise.all(uniqueLeaseIds.map(async (leaseId) => {
      try {
        const lease = await InvoiceService.getLease(leaseId as number);
        const [renterRes, unitRes] = await Promise.allSettled([
          InvoiceService.getRenter(lease.renter),
          InvoiceService.getUnit(lease.unit)
        ]);
        return {
          id: leaseId,
          data: {
            renter: renterRes.status === 'fulfilled' ? (renterRes.value as any).full_name : "Unknown",
            unit: unitRes.status === 'fulfilled' ? ((unitRes.value as any).name) : "N/A"
          }
        };
      } catch { return { id: leaseId, data: { renter: "Err", unit: "Err" } }; }
    }));

    setCache(prev => {
      const updated = { ...prev };
      results.forEach(res => { if (res) updated[Number(res.id)] = res.data; });
      return updated;
    });
  }, [cache]);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await InvoiceService.list(filters);
      setData(res);
      await hydrateData(res.results || []);
    } catch (err) {
      error("Directory sync failed.");
    } finally {
      setLoading(false);
    }
  }, [filters, hydrateData, error]);

  const bulkGenerate = async () => {
    if (!window.confirm("⚠️ Generate invoices for all active leases for the current month?")) return;
    setIsGenerating(true);
    try {
      await InvoiceService.generateMonthly();
      success("Bulk generation complete.");
      await loadInvoices();
    } catch (err) {
      error("Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  return { data, loading, isGenerating, cache, actions: { refresh: loadInvoices, generate: bulkGenerate } };
}