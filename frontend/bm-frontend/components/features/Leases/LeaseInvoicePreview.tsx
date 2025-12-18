import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";

export default function LeaseInvoicePreview({ leaseId }: { leaseId: number }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/invoices/invoices/?lease=${leaseId}`)
      .then(r => setInvoices(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [leaseId]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'success';
      case 'unpaid': return 'danger';
      case 'partially_paid': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) return <div className="text-center p-3"><div className="spinner-border spinner-border-sm text-primary"></div></div>;

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="card-header bg-white py-3">
        <h6 className="fw-bold mb-0"><i className="bi bi-receipt me-2 text-primary"></i>Recent Billing Activity</h6>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 small">
          <thead className="bg-light">
            <tr>
              <th className="ps-3">Invoice Type</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-muted small">No invoices generated yet.</td></tr>
            ) : invoices.map(inv => (
              <tr key={inv.id}>
                <td className="ps-3 text-capitalize fw-medium">{inv.invoice_type?.replace('_', ' ')}</td>
                <td className="text-muted">{inv.due_date}</td>
                <td className="fw-bold text-dark">৳{Number(inv.amount).toLocaleString()}</td>
                <td>
                  <span className={`badge rounded-pill bg-${getStatusColor(inv.status)} bg-opacity-10 text-${getStatusColor(inv.status)} px-2`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}