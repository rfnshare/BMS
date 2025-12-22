import { useState, useEffect, useCallback } from "react";
import {ReportService} from "../services/reportService";
import {getErrorMessage} from "../utils/getErrorMessage";

export function useReports() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadAllReports = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Parallel fetching for maximum performance
      const [finSum, finInv, occSum, occVac, renCol, renDue] = await Promise.all([
        ReportService.getFinancialSummary(),
        ReportService.getFinancialInvoices({ page: 1 }),
        ReportService.getOccupancySummary(),
        ReportService.getVacantUnits({ page: 1 }),
        ReportService.getRenterCollection(),
        ReportService.getTopDues()
      ]);

      setData({
        financial: { summary: finSum, invoices: finInv.results },
        occupancy: { summary: occSum, vacant: occVac.results },
        renters: { collection: renCol, dues: renDue }
      });
    } catch (error: any) {
      console.error("Report Fetch Error:", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllReports();
  }, [loadAllReports]);

  return { data, loading, refresh: loadAllReports };
}