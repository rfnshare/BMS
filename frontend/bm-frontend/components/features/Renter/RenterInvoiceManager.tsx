import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

export default function RenterInvoiceManager() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // Options: all | paid | unpaid

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Backend automatically filters results by the Renter's token
      const res = await api.get("/invoices/");
      setInvoices(res.data.results || res.data);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  // SQA Logic: Local filtering for high-speed UI response
  const filteredData = useMemo(() => {
    if (filter === "all") return invoices;
    return invoices.filter(inv => inv.status === filter);
  }, [invoices, filter]);

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. FILTER CONTROLS */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <div className="btn-group p-1 bg-light rounded-pill">
          {['all', 'paid', 'unpaid'].map((s) => (
            <button
              key={s}
              className={`btn btn-sm rounded-pill px-4 fw-bold text-uppercase ${filter === s ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="text-muted small fw-medium">
          Total Records: <span className="text-primary fw-bold">{filteredData.length}</span>
        </div>
      </div>

      {/* 2. INVOICE TABLE */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light small text-muted text-uppercase">
              <tr>
                <th className="ps-4 py-3">Invoice #</th>
                <th>Category</th>
                <th>Billing Month</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th className="text-center">Status</th>
                <th className="pe-4 text-end">Documents</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-5 text-muted italic">No invoices found for this criteria.</td></tr>
              ) : filteredData.map((inv) => (
                <tr key={inv.id}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark small">{inv.invoice_number}</div>
                    <div className="text-muted x-small">ID: #{inv.id}</div>
                  </td>
                  <td className="small text-capitalize">{inv.invoice_type.replace('_', ' ')}</td>
                  <td className="small">{inv.invoice_month || 'N/A'}</td>
                  <td className="small text-muted">{inv.due_date}</td>
                  <td className="fw-bold text-dark">৳{Number(inv.amount).toLocaleString()}</td>
                  <td className="text-center">
                    <span className={`badge rounded-pill border px-3 py-2 ${inv.status === 'paid' ? 'bg-success-subtle text-success border-success' : 'bg-warning-subtle text-warning border-warning'}`}>
                      {inv.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="pe-4 text-end">
                    {inv.invoice_pdf ? (
                      <a href={inv.invoice_pdf} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold">
                        <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                      </a>
                    ) : (
                      <span className="text-muted x-small italic">Pending PDF</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}