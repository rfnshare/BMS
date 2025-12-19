import { useEffect, useState } from "react";
import { InvoiceService } from "../../../logic/services/invoiceService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import InvoiceModal from "./InvoiceModal";
import InvoicePreviewModal from "./InvoicePreviewModal";

export default function InvoiceManager() {
  // 1. Data State
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false); // For bulk button spinner

  // 2. Filter State (Default sort: Newest First)
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    ordering: "-id"
  });

  // 3. Cache & Modals
  const [cache, setCache] = useState({});
  const [activeModal, setActiveModal] = useState({ type: null, data: null });

  // --- API CALLS ---

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await InvoiceService.list(filters);
      setData(res);
      // Immediately start fetching names for these invoices
      hydrateData(res.results || []);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const hydrateData = async (invoices) => {
    // Identify distinct lease IDs not yet in cache
    const uniqueLeaseIds = [...new Set(invoices.map(inv => inv.lease))]
      .filter(id => id && !cache[id]);

    if (uniqueLeaseIds.length === 0) return;

    // Fetch details in parallel tasks
    const hydrationTasks = uniqueLeaseIds.map(async (leaseId) => {
      try {
        // Fetch Lease first to get Renter ID and Unit ID
        const lease = await InvoiceService.getLease(leaseId);

        // Fetch Renter and Unit in parallel
        const [renterRes, unitRes] = await Promise.allSettled([
          InvoiceService.getRenter(lease.renter),
          InvoiceService.getUnit(lease.unit)
        ]);

        return {
          id: leaseId,
          data: {
            renter: renterRes.status === 'fulfilled' ? renterRes.value.full_name : "Unknown",
            // Schema uses 'name' for Unit, not unit_number
            unit: unitRes.status === 'fulfilled' ? (unitRes.value.name) : "Unknown"
          }
        };
      } catch (e) {
        return { id: leaseId, data: { renter: "Error", unit: "Error" } };
      }
    });

    const results = await Promise.all(hydrationTasks);

    // Update cache without wiping existing data
    setCache(prev => {
      const updated = { ...prev };
      results.forEach(res => {
        if(res) updated[res.id] = res.data;
      });
      return updated;
    });
  };

  useEffect(() => { loadInvoices(); }, [filters.status, filters.page, filters.search]);

  // --- ACTIONS ---

  const handleBulkGenerate = async () => {
    const confirmMsg = "⚠️ Are you sure you want to generate invoices for ALL active leases?\n\nThis will:\n1. Create invoices for the current month\n2. Send Email/WhatsApp notifications to renters";

    if (!window.confirm(confirmMsg)) return;

    setIsGenerating(true);
    try {
      // Calls POST /api/scheduling/manual-invoice/
      await InvoiceService.generateMonthly();
      alert("✅ Success! Monthly invoices have been generated and sent.");
      loadInvoices(); // Refresh list to see new items
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async (invoice) => {
    // A. If PDF URL already exists in the list, open it
    if (invoice.invoice_pdf) {
      window.open(invoice.invoice_pdf, '_blank');
      return;
    }

    // B. If not, generate it
    const isConfirmed = window.confirm("⚠️ PDF not found. Generate a new one now?");
    if (!isConfirmed) return;

    try {
      setLoading(true);

      // Calls POST /api/invoices/{id}/generate_pdf/
      const response = await InvoiceService.generatePdf(invoice.id);

      // 🔥 FIX: Handle the specific { "pdf": "..." } response structure
      if (response && response.pdf) {

        // Check if URL is relative (starts with /media) or absolute
        let pdfUrl = response.pdf;
        if (pdfUrl.startsWith("/")) {
            // Prepend Backend URL (Adjust this if your live server is different)
            pdfUrl = `http://127.0.0.1:8000${pdfUrl}`;
        }

        window.open(pdfUrl, '_blank');
        loadInvoices(); // Refresh list to save the URL for next time
      } else {
        alert("Server returned a success status, but no 'pdf' link was found.");
      }
    } catch (err) {
      alert("Failed to generate PDF. " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

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

  // Helper to format YYYY-MM-DD -> "Feb 2025"
  const formatMonth = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  return (
    <div className="bg-white">
      {/* 1. FILTER & ACTION BAR */}
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

        <div className="d-flex gap-2">
            {/* Bulk Generate Button */}
            <button
                className="btn btn-warning btn-sm rounded-pill px-3 fw-bold shadow-sm text-dark"
                onClick={handleBulkGenerate}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <span><span className="spinner-border spinner-border-sm me-2"></span>Processing...</span>
                ) : (
                    <span><i className="bi bi-lightning-charge-fill me-2"></i>Generate Monthly</span>
                )}
            </button>

            {/* Create Single Button */}
            <button
                className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm"
                onClick={() => setActiveModal({ type: 'edit', data: null })}
            >
                <i className="bi bi-plus-lg me-2"></i>Create Invoice
            </button>
        </div>
      </div>

      {/* 2. TABLE */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr className="text-muted x-small fw-bold text-uppercase">
              <th className="ps-4 py-3">Invoice #</th>
              <th>Billed Month</th>
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
                  <div className="text-muted x-small">Created: {inv.invoice_date}</div>
                </td>

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
                      {/* PDF Button */}
                      <button
                        className="btn btn-sm btn-white border-end"
                        title={inv.invoice_pdf ? "Download PDF" : "Generate PDF"}
                        onClick={() => handleDownloadPdf(inv)}
                      >
                        <i className={`bi ${inv.invoice_pdf ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-pdf text-secondary'}`}></i>
                      </button>

                      {/* Preview Button */}
                      <button
                        className="btn btn-sm btn-white border-end"
                        onClick={() => setActiveModal({type: 'preview', data: inv})}
                      >
                        <i className="bi bi-eye text-primary"></i>
                      </button>

                      {/* Edit Button */}
                      <button
                        className="btn btn-sm btn-white border-end"
                        onClick={() => setActiveModal({type: 'edit', data: inv})}
                      >
                        <i className="bi bi-pencil text-warning"></i>
                      </button>

                      {/* Delete Button */}
                      <button
                        className="btn btn-sm btn-white"
                        onClick={() => handleDelete(inv.id)}
                      >
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