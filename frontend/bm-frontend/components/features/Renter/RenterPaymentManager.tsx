import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Added Notifications
import { Spinner, Badge, Row, Col, Table, Button } from "react-bootstrap";

export default function RenterPaymentManager() {
  const { error: notifyError } = useNotify();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Backend automatically filters results by the Renter's token
      const res = await api.get("/payments/");
      setPayments(res.data.results || res.data);
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  // 1. DYNAMIC PAYMENT STATS (Blueprint Logic - Raw vs Display)
  const stats = useMemo(() => {
    const rawTotal = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const lastPayment = payments.length > 0 ? Number(payments[0].amount) : 0;

    return [
      { label: "Lifetime Contribution", display: `৳${rawTotal.toLocaleString()}`, raw: rawTotal, color: "success", icon: "bi-shield-check" },
      { label: "Verified Receipts", display: payments.length.toString().padStart(2, '0'), raw: payments.length, color: "primary", icon: "bi-receipt" },
      { label: "Last Transaction", display: `৳${lastPayment.toLocaleString()}`, raw: lastPayment, color: "info", icon: "bi-arrow-repeat" },
      { label: "Active Methods", display: new Set(payments.map(p => p.method)).size.toString().padStart(2, '0'), raw: 0, color: "warning", icon: "bi-wallet2" },
    ];
  }, [payments]);

  if (loading && payments.length === 0) return (
    <div className="text-center py-5 vstack gap-3 animate__animated animate__fadeIn">
      <Spinner animation="grow" variant="success" size="sm" />
      <p className="text-muted fw-bold x-small text-uppercase ls-1">Retrieving Financial Records...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn pb-5">

      {/* 2. INDUSTRIAL HEADER BLOCK (Right-Aligned Actions) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-success bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success border border-success border-opacity-10 d-none d-md-block">
                <i className="bi bi-bank fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Payment Ledger</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">
                    Verified Transaction History & Receipt Archive
                </p>
              </div>
            </div>
            <div className="ms-md-auto">
                <Button variant="light" className="rounded-pill px-4 fw-bold small border ls-1 text-muted shadow-sm" onClick={loadPayments}>
                    <i className="bi bi-arrow-clockwise me-2"></i>SYNC TRANSACTIONS
                </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RESIDENT PAYMENT KPIs */}
      <Row className="g-2 g-md-3 mb-4">
        {stats.map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
              </div>
              <div className={`h4 fw-bold mb-0 text-dark fs-5 fs-md-4 font-monospace`}>
                {s.display}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 4. DATA VIEW: INDUSTRIAL TABLE (Desktop) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3 d-none d-md-block">
        <Table hover className="align-middle mb-0 font-monospace-ledger">
          <thead className="bg-light border-bottom">
            <tr className="text-muted x-small fw-bold text-uppercase ls-1">
              <th className="ps-4 py-3">Receipt Identity</th>
              <th>Transaction Date</th>
              <th>Method</th>
              <th>Reference Protocol</th>
              <th className="pe-4 text-end">Credit Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-5 text-muted x-small fw-bold ls-1">NO TRANSACTION HISTORY FOUND.</td></tr>
            ) : payments.map((pay) => (
              <tr key={pay.id}>
                <td className="ps-4">
                  <div className="fw-bold text-primary small font-monospace">RCP-{pay.id.toString().padStart(4, '0')}</div>
                  <div className="text-muted x-small fw-bold ls-1 opacity-75 text-uppercase">System Verified</div>
                </td>
                <td className="small fw-bold text-muted text-uppercase ls-1">
                    {new Date(pay.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                    <Badge pill className="bg-light text-dark border px-3 py-2 fw-bold ls-1 text-uppercase x-small">
                        <i className={`bi bi-${pay.method === 'bank' ? 'bank' : 'wallet2'} me-2 text-primary`}></i>
                        {pay.method}
                    </Badge>
                </td>
                <td>
                    <div className="font-monospace small text-muted opacity-75 fw-bold">
                        {pay.transaction_reference || 'INTERNAL_SETTLE'}
                    </div>
                </td>
                <td className="pe-4 text-end fw-bold text-success font-monospace">
                  ৳{Number(pay.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* 5. MOBILE VIEW: TRANSACTION FEED */}
      <div className="d-block d-md-none vstack gap-2 p-2">
        {payments.map((pay) => (
          <div key={pay.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="fw-bold text-primary font-monospace small">RCP-{pay.id.toString().padStart(4, '0')}</div>
                <div className="fw-bold text-success font-monospace">৳{Number(pay.amount).toLocaleString()}</div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="x-small text-muted fw-bold ls-1 text-uppercase">
                   <i className="bi bi-calendar-event me-1"></i>
                   {new Date(pay.payment_date).toLocaleDateString()}
                </div>
                <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-10 x-small ls-1 fw-bold">
                    {pay.method.toUpperCase()}
                </Badge>
            </div>
            {pay.transaction_reference && (
                <div className="mt-2 pt-2 border-top border-light x-small font-monospace text-muted opacity-50 text-truncate">
                    REF: {pay.transaction_reference}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}