import { useEffect, useState } from "react";
import { InvoiceService } from "../../../logic/services/invoiceService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import InvoiceModal from "./InvoiceModal";
import InvoicePreviewModal from "./InvoicePreviewModal";
import api from "../../../logic/services/apiClient";

export default function InvoiceManager() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);

  // 🔥 FIX 1: Added 'ordering: "-id"' to sort by Newest Created first
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    ordering: "-id"
  });

  const [cache, setCache] = useState({});
  const [activeModal, setActiveModal] = useState({ type: null, data: null });

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await InvoiceService.list(filters);
      setData(res);
      hydrateData(res.results || []);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const hydrateData = async (invoices) => {
    const uniqueLeaseIds = [...new Set(invoices.map(inv => inv.lease))]
      .filter(id => id && !cache[id]);

    if (uniqueLeaseIds.length === 0) return;

    const hydrationTasks = uniqueLeaseIds.map(async (leaseId) => {
      try {
        const lease = await InvoiceService.getLease(leaseId);
        const [renterRes, unitRes] = await Promise.allSettled([
          InvoiceService.getRenter(lease.renter),
          InvoiceService.getUnit(lease.unit)
        ]);

        return {
          id: leaseId,
          data: {
            renter: renterRes.status === 'fulfilled' ? renterRes.value.full_name : "Unknown",
            unit: unitRes.status === 'fulfilled' ? (unitRes.value.name || unitRes.value.unit_number) : "Unknown"
          }
        };
      } catch (e) {
        return { id: leaseId, data: { renter: "Error", unit: "Error" } };
      }
    });

    const results = await Promise.all(hydrationTasks);

    setCache(prev => {
      const updated = { ...prev };
      results.forEach(res => {
        updated[res.id] = res.data;
      });
      return updated;
    });
  };

  useEffect(() => { loadInvoices(); }, [filters.status, filters.page, filters.search]);

  const handleDelete = async (id) => {
    if (confirm("⚠️ SQA Warning: Deleting an invoice will affect financial reports. Proceed?")) {
      try {
        await InvoiceService.destroy(id);
        loadInvoices();
      } catch (err) {
        alert(getErrorMessage(err));
      }
    }
  };

  // Helper to format YYYY-MM-DD to "Feb 2025"
  const formatMonth = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    // Use UTC to prevent timezone shifts (e.g., Feb 1st becoming Jan 31st)
    return date.toLocaleDateString('default', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  return (
    <div className="bg-white">
      {/* 1. FILTER BAR */}
      <div className="p-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex gap-2">
           <input
             type="text"
             className="form-control form-control-sm rounded-pill px-3 bg-light border-0"
             placeholder="Search Invoice #..."
             style={{ width: '250px' }}
             onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
           />
           <select
             className="form-select form-select-sm rounded-pill px-3 bg-light border-0 w-auto"
             value={filters.status}
             onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
           >
             <option value="">All Statuses</option>
             <option value="unpaid">Unpaid</option>
             <option value="paid">Paid</option>
             <option value="draft">Draft</option>
           </select>
        </div>
        <button
          className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => setActiveModal({ type: 'edit', data: null })}
        >
          <i className="bi bi-plus-lg me-2"></i>Create Invoice
        </button>
      </div>

      {/* 2. TABLE CONTENT */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr className="text-muted x-small fw-bold text-uppercase">
              <th className="ps-4 py-3">Invoice #</th>
              <th>Billed Month</th> {/* 🔥 FIX 2: New Column Header */}
              <th>Renter & Lease</th>
              <th>Unit</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="pe-4 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
            ) : data.results.map((inv) => (
              <tr key={inv.id}>
                <td className="ps-4">
                  <div className="fw-bold text-dark">{inv.invoice_number}</div>
                  <div className="text-muted x-small">Date: {inv.invoice_date}</div>
                </td>

                {/* 🔥 FIX 2: New Column Data */}
                <td>
                  <span className="badge bg-light text-dark border fw-normal">
                    <i className="bi bi-calendar-event me-1"></i>
                    {formatMonth(inv.invoice_month)}
                  </span>
                </td>

                <td>
                  <div className="fw-bold small text-primary">
                    {cache[inv.lease]?.renter || "Loading..."}
                  </div>
                  <div className="text-muted x-small fw-bold">
                    ID: <span className="text-dark">LS-{inv.lease}</span>
                  </div>
                </td>

                <td>
                  <div className="badge bg-light text-dark border fw-normal">
                    <i className="bi bi-door-open me-1"></i>
                    {cache[inv.lease]?.unit || "..."}
                  </div>
                </td>

                <td className="text-capitalize small">
                  {inv.invoice_type.replace('_', ' ')}
                </td>

                <td className="fw-bold">
                  ৳{Number(inv.amount).toLocaleString()}
                </td>

                <td>
                   <span className={`badge rounded-pill border px-3 py-1 ${
                     inv.status === 'paid' ? 'bg-success-subtle text-success border-success' : 
                     inv.status === 'unpaid' ? 'bg-danger-subtle text-danger border-danger' : 
                     'bg-warning-subtle text-warning border-warning'
                   }`}>
                     {inv.status.toUpperCase()}
                   </span>
                </td>

                <td className="pe-4 text-end">
                   <div className="btn-group shadow-sm rounded-3">
                      <button className="btn btn-sm btn-white border-end" onClick={() => setActiveModal({type: 'preview', data: inv})}>
                        <i className="bi bi-eye text-primary"></i>
                      </button>
                      <button className="btn btn-sm btn-white border-end" onClick={() => setActiveModal({type: 'edit', data: inv})}>
                        <i className="bi bi-pencil text-warning"></i>
                      </button>
                      <button className="btn btn-sm btn-white" onClick={() => handleDelete(inv.id)}>
                        <i className="bi bi-trash text-danger"></i>
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. PAGINATION */}
      <div className="p-3 border-top d-flex justify-content-between align-items-center">
        <span className="text-muted x-small">Total Records: {data.count}</span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-light border rounded-pill px-3"
            disabled={!data.previous}
            onClick={() => setFilters({...filters, page: filters.page - 1})}
          >Prev</button>
          <button
            className="btn btn-sm btn-light border rounded-pill px-3"
            disabled={!data.next}
            onClick={() => setFilters({...filters, page: filters.page + 1})}
          >Next</button>
        </div>
      </div>

      {/* MODALS */}
      {activeModal.type === 'edit' && (
        <InvoiceModal
          invoice={activeModal.data}
          onClose={() => setActiveModal({type: null, data: null})}
          onSaved={() => { setActiveModal({type: null, data: null}); loadInvoices(); }}
        />
      )}
      {activeModal.type === 'preview' && (
        <InvoicePreviewModal
          invoice={activeModal.data}
          onClose={() => setActiveModal({type: null, data: null})}
        />
      )}
    </div>
  );
}