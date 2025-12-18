import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

export default function RenterPaymentManager() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Backend automatically filters results by the Renter's token
      const res = await api.get("/payments/");
      setPayments(res.data.results || res.data);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  // SQA Logic: Calculating a quick total for the renter's peace of mind
  const totalPaid = useMemo(() => {
    return payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [payments]);

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. PAYMENT SUMMARY CARD */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-success text-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="small fw-bold text-uppercase opacity-75">Lifetime Payments</div>
                <div className="h2 fw-bold mb-0">৳{totalPaid.toLocaleString()}</div>
              </div>
              <i className="bi bi-shield-check fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRANSACTIONS TABLE */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="card-header bg-white border-0 p-4">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-primary"></i> Transaction History
          </h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light small text-muted text-uppercase">
              <tr>
                <th className="ps-4 py-3">Receipt ID</th>
                <th>Date</th>
                <th>Method</th>
                <th>Reference #</th>
                <th className="text-end pe-4">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5 text-muted italic">No payment transactions recorded yet.</td></tr>
              ) : payments.map((pay) => (
                <tr key={pay.id}>
                  <td className="ps-4 fw-bold">RCP-{pay.id.toString().padStart(4, '0')}</td>
                  <td className="small text-muted">{new Date(pay.payment_date).toLocaleDateString()}</td>
                  <td>
                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2 text-capitalize">
                      <i className={`bi bi-${pay.method === 'bank' ? 'bank' : 'wallet2'} me-1`}></i>
                      {pay.method}
                    </span>
                  </td>
                  <td className="font-monospace small text-muted">
                    {pay.transaction_reference || '---'}
                  </td>
                  <td className="text-end pe-4 fw-bold text-success">
                    ৳{Number(pay.amount).toLocaleString()}
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