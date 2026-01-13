import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { LeaseService } from "../../../logic/services/leaseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import Link from "next/link";
import { Badge, Row, Col, ListGroup, Spinner, Container, Form } from "react-bootstrap";

export default function RenterDashboard() {
  const [leases, setLeases] = useState<any[]>([]); // 🚀 Now handles multiple leases
  const [selectedLeaseIdx, setSelectedLeaseIdx] = useState(0); // For unit switching
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const activeLeases = await LeaseService.getMyActiveLease();
      // 🚀 SQA FIX: Store the entire array of active leases
      setLeases(Array.isArray(activeLeases) ? activeLeases : [activeLeases]);

      const invRes = await api.get("/invoices/");
      setInvoices(invRes.data.results || []);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Use the currently selected lease based on user choice
  const lease = useMemo(() => leases[selectedLeaseIdx] || null, [leases, selectedLeaseIdx]);

  if (loading) return (
    <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted fw-bold small text-uppercase ls-1">Syncing Residency Records...</p>
    </div>
  );

  return (
    <Container fluid className="px-2 px-md-3 py-2 animate__animated animate__fadeIn">

      {/* 🚀 1. UNIT SELECTOR (Only shows if more than 1 active lease exists) */}
      {leases.length > 1 && (
        <div className="mb-4 bg-white p-3 rounded-4 shadow-sm border-start border-4 border-warning">
          <label className="x-small fw-bold text-uppercase text-muted mb-2 d-block">Select Unit Dashboard</label>
          <Form.Select
            className="rounded-pill border-0 bg-light fw-bold shadow-none"
            value={selectedLeaseIdx}
            onChange={(e) => setSelectedLeaseIdx(Number(e.target.value))}
          >
            {leases.map((l, idx) => (
              <option key={l.id} value={idx}>
                UNIT {l.unit_name || l.unit} — {l.status?.toUpperCase()}
              </option>
            ))}
          </Form.Select>
        </div>
      )}

      {/* 2. FINANCIAL KPI SECTION (Specific to Selected Lease) */}
      <Row className="g-2 g-md-4 mb-4">
        <Col xs={12} md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 border-start border-danger border-5 bg-white">
            <div className="text-muted fw-bold text-uppercase mb-1" style={{fontSize: '0.65rem'}}>Current Balance Due</div>
            <div className="h2 fw-bold mb-0 text-danger">
                ৳{Number(lease?.current_balance || 0).toLocaleString()}
            </div>
            {Number(lease?.current_balance) > 0 && (
                <div className="text-danger x-small fw-bold mt-1 animate__animated animate__pulse animate__infinite">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i> Outstanding for Unit {lease?.unit_name}
                </div>
            )}
          </div>
        </Col>

        <Col xs={6} md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 border-start border-primary border-4 bg-white h-100">
            <div className="text-muted fw-bold text-uppercase mb-1" style={{fontSize: '0.6rem'}}>Deposit Held</div>
            <div className="h4 fw-bold mb-0 text-primary">
                ৳{Number(lease?.security_deposit || 0).toLocaleString()}
            </div>
            <Badge bg={lease?.deposit_status === 'paid' ? 'success' : 'warning'} className="mt-2 x-small border-0 px-2 py-1">
                {lease?.deposit_status?.toUpperCase() || 'PENDING'}
            </Badge>
          </div>
        </Col>

        <Col xs={6} md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 border-start border-success border-4 bg-white h-100">
            <div className="text-muted fw-bold text-uppercase mb-1" style={{fontSize: '0.6rem'}}>Status</div>
            <div className="h4 fw-bold mb-0 text-success text-capitalize">{lease?.status || 'Active'}</div>
            <div className="x-small text-muted mt-2">
                Since {lease?.start_date ? new Date(lease.start_date).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          {/* 3. BILLING TABLE (Filters by unit if possible, or shows all) */}
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
            <div className="card-header bg-white border-0 pt-4 px-3 px-md-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Billing</h5>
              <Link href="/renter-dashboard/invoices" className="text-decoration-none small fw-bold">View Ledger</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light x-small text-muted text-uppercase">
                  <tr>
                    <th className="ps-3 ps-md-4 py-3">Invoice</th>
                    <th>Unit</th>
                    <th>Amount</th>
                    <th className="pe-3 pe-md-4 text-end">Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {invoices.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-4 text-muted">No billing records found.</td></tr>
                  ) : (
                    invoices.slice(0, 5).map(inv => (
                      <tr key={inv.id} className={inv.unit_name === lease?.unit_name ? 'table-primary-subtle' : ''}>
                        <td className="ps-3 ps-md-4 py-3 fw-bold text-primary">#{inv.invoice_number?.split('-').pop()}</td>
                        <td className="text-muted small">{inv.unit_name || 'N/A'}</td>
                        <td className="fw-bold text-dark">৳{Number(inv.amount).toLocaleString()}</td>
                        <td className="pe-3 pe-md-4 text-end">
                          <Badge pill bg={inv.status === 'paid' ? 'success' : 'danger'} className="x-small border-0">
                            {inv.status?.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. POSSESSION CHECKLIST (Specific to Selected Unit) */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 mb-4">
            <h6 className="fw-bold text-uppercase small text-muted mb-3 ls-1">Unit {lease?.unit_name} Checklist</h6>
            <Row className="g-2 g-md-3">
                {[
                    { label: 'Electricity', val: lease?.electricity_card_given, icon: 'lightning-charge' },
                    { label: 'Gas Card', val: lease?.gas_card_given, icon: 'fuel-pump' },
                    { label: 'Agreement', val: lease?.agreement_paper_given, icon: 'file-earmark-text' },
                    { label: 'NID Ver.', val: lease?.police_verification_done, icon: 'shield-check' }
                ].map((item, idx) => (
                    <Col key={idx} xs={6} md={3}>
                        <div className={`p-3 rounded-4 border text-center h-100 transition-all ${item.val ? 'bg-success-subtle border-success text-success shadow-sm' : 'bg-light text-muted border-light'}`}>
                            <i className={`bi bi-${item.val ? 'check-circle-fill' : 'dash-circle'} fs-5 d-block mb-1`}></i>
                            <div style={{fontSize: '0.6rem'}} className="fw-bold text-uppercase">{item.label}</div>
                        </div>
                    </Col>
                ))}
            </Row>
          </div>
        </Col>

        {/* 5. FINANCIAL BREAKDOWN PANEL */}
        <Col lg={4}>
          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-4 h-100 shadow-lg position-relative overflow-hidden">
            <h6 className="text-warning fw-bold text-uppercase mb-4 small ls-1">Unit {lease?.unit_name} Breakdown</h6>
            <ListGroup variant="flush" className="bg-transparent mb-4">
                {lease?.lease_rents?.length > 0 ? (
                    lease.lease_rents.map((rent: any) => (
                        <ListGroup.Item key={rent.id} className="bg-transparent text-white border-secondary border-opacity-25 px-0 d-flex justify-content-between py-2">
                            <span className="opacity-75 small">{rent.rent_type_name}</span>
                            <span className="fw-bold small text-warning">৳{Number(rent.amount).toLocaleString()}</span>
                        </ListGroup.Item>
                    ))
                ) : (
                    <div className="small text-muted italic">No breakdown available.</div>
                )}
            </ListGroup>

            <div className="mt-auto p-3 bg-white bg-opacity-10 rounded-4 text-center border border-secondary border-opacity-25">
                <div className="small opacity-50 text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Monthly Payable (Unit {lease?.unit_name})</div>
                <div className="h2 fw-bold mb-0 text-warning">
                    ৳{Number(lease?.rent_amount || 0).toLocaleString()}
                </div>
            </div>

            <div className="mt-4 vstack gap-2">
                <Link href="/renter-dashboard/unit" className="btn btn-outline-light rounded-pill fw-bold py-2">
                    <i className="bi bi-house-door me-2"></i>Unit Details
                </Link>
                <Link href="/renter-dashboard/complaints" className="btn btn-warning rounded-pill fw-bold text-dark py-2 shadow">
                    <i className="bi bi-chat-dots me-2"></i>Report Maintenance
                </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}