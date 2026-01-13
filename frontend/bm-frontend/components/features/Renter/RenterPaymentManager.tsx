import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner } from "react-bootstrap";

export default function RenterPaymentManager() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments/");
      setPayments(res.data.results || res.data);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  const totalPaid = useMemo(() => {
    return payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [payments]);

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. PAYMENT SUMMARY CARD */}
      <div className="row mb-4 px-1">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-success text-white border-bottom border-4 border-dark border-opacity-10">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="small fw-bold text-uppercase opacity-75" style={{ fontSize: '0.65rem' }}>Lifetime Payments</div>
                <div className="h2 fw-bold mb-0">৳{totalPaid.toLocaleString()}</div>
              </div>
              <i className="bi bi-shield-check fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRANSACTION HISTORY */}
      <div className="px-1">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : payments.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border">
            <i className="bi bi-clock-history fs-1 text-muted opacity-25 d-block mb-2"></i>
            <span className="text-muted small italic">No transactions recorded yet.</span>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: List Cards */}
            <div className="d-md-none vstack gap-2">
              {payments.map((pay) => (
                <div key={pay.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <div className="min-vw-0">
                      <div className="fw-bold text-dark small">RCP-{pay.id.toString().padStart(4, '0')}</div>
                      <div className="text-muted x-small fw-bold">{new Date(pay.payment_date).toLocaleDateString()}</div>
                    </div>
                    <div className="fw-bold text-success">৳{Number(pay.amount).toLocaleString()}</div>
                  </div>

                  <div className="bg-light p-2 rounded-3 mt-1 d-flex justify-content-between align-items-center">
                    <div className="text-truncate me-2" style={{ minWidth: 0 }}>
                      <span className="text-muted x-small fw-bold text-uppercase d-block" style={{ fontSize: '0.55rem' }}>Reference</span>
                      <span className="font-monospace small text-dark text-truncate d-block">{pay.transaction_reference || 'Internal'}</span>
                    </div>
                    <span className="badge bg-white text-dark border rounded-pill x-small text-capitalize flex-shrink-0">
                      <i className={`bi bi-${pay.method === 'bank' ? 'bank' : 'wallet2'} me-1 text-primary`}></i>
                      {pay.method}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Legacy Table */}
            <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
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
                    {payments.map((pay) => (
                      <tr key={pay.id}>
                        <td className="ps-4 fw-bold">RCP-{pay.id.toString().padStart(4, '0')}</td>
                        <td className="small text-muted">{new Date(pay.payment_date).toLocaleDateString()}</td>
                        <td>
                          <span className="badge bg-light text-dark border rounded-pill px-3 py-2 text-capitalize">
                            <i className={`bi bi-${pay.method === 'bank' ? 'bank' : 'wallet2'} me-1`}></i>
                            {pay.method}
                          </span>
                        </td>
                        <td className="font-monospace small text-muted">{pay.transaction_reference || '---'}</td>
                        <td className="text-end pe-4 fw-bold text-success">৳{Number(pay.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}