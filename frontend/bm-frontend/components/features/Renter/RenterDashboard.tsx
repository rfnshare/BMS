import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { LeaseService } from "../../../logic/services/leaseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import Link from "next/link";
import { Badge, Row, Col, ListGroup, Spinner, Container, Button } from "react-bootstrap";

export default function RenterDashboard() {
  const [lease, setLease] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const activeLease = await LeaseService.getMyActiveLease();
      setLease(activeLease);
      const invRes = await api.get("/api/invoices/invoices/");
      setInvoices(invRes.data.results || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center vstack gap-3">
      <Spinner animation="grow" variant="primary" size="sm" />
      <p className="text-muted fw-bold x-small text-uppercase ls-1">Syncing Resident Profile...</p>
    </div>
  );

  return (
    <Container fluid className="p-2 p-md-0 animate__animated animate__fadeIn pb-5">

      {/* 1. INDUSTRIAL HEADER BLOCK */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
              <i className="bi bi-speedometer2 fs-4"></i>
            </div>
            <div>
              <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Resident Command</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">
                Residency ID: #LS-{lease?.id || 'N/A'} — {lease?.unit_name || 'Unit Assignment Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI GRID */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 border-start border-4 border-danger bg-white h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{fontSize: '0.6rem'}}>Outstanding Due</small>
                <i className="bi bi-wallet2 text-danger opacity-25"></i>
            </div>
            <div className="h2 fw-bold mb-1 text-danger font-monospace">
                ৳{Number(lease?.current_balance || 0).toLocaleString()}
            </div>
            {Number(lease?.current_balance) > 0 && (
                <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-10 x-small ls-1 fw-bold align-self-start">
                    <i className="bi bi-exclamation-triangle me-1"></i>SETTLEMENT REQUIRED
                </Badge>
            )}
          </div>
        </Col>

        <Col xs={6} md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 border-start border-4 border-primary bg-white h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{fontSize: '0.6rem'}}>Security Deposit</small>
                <i className="bi bi-shield-check text-primary opacity-25"></i>
            </div>
            <div className="h2 fw-bold mb-1 text-primary font-monospace">
                ৳{Number(lease?.security_deposit || 0).toLocaleString()}
            </div>
            <Badge pill bg={lease?.deposit_status === 'paid' ? 'success' : 'warning'} className="x-small ls-1 fw-bold">
                {lease?.deposit_status?.toUpperCase() || 'PENDING'}
            </Badge>
          </div>
        </Col>

        <Col xs={6} md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 border-start border-4 border-success bg-white h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{fontSize: '0.6rem'}}>Lease Lifecycle</small>
                <i className="bi bi-calendar-check text-success opacity-25"></i>
            </div>
            <div className="h2 fw-bold mb-1 text-success text-uppercase ls-1 fs-4">
                {lease?.status || 'Active'}
            </div>
            <div className="x-small text-muted fw-bold ls-1 text-uppercase opacity-75">
                Valid Since {lease?.start_date ? new Date(lease.start_date).toLocaleDateString('en-GB') : 'N/A'}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* 3. MAIN LEDGER & REGISTRY AREA */}
        <Col lg={8}>
          {/* BILLING HISTORY TABLE */}
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
            <div className="card-header bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-uppercase ls-1 small text-muted">Financial Settlement History</h6>
              <Link href="/renter-dashboard/invoices" className="x-small fw-bold text-primary text-decoration-none ls-1">VIEW ALL</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-white border-bottom">
                  <tr className="x-small text-muted text-uppercase ls-1 fw-bold">
                    <th className="ps-4 py-3">Audit #</th>
                    <th>Billing Date</th>
                    <th>Ledger Amount</th>
                    <th className="pe-4 text-end">Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {invoices.slice(0, 5).map(inv => (
                    <tr key={inv.id}>
                      <td className="ps-4 py-3 fw-bold text-dark font-monospace">#{inv.invoice_number?.split('-').pop()}</td>
                      <td className="fw-bold text-muted">{inv.invoice_date}</td>
                      <td className="fw-bold text-dark font-monospace">৳{Number(inv.amount).toLocaleString()}</td>
                      <td className="pe-4 text-end">
                        <Badge pill className={`x-small px-3 py-2 border ls-1 fw-bold ${inv.status === 'paid' ? 'bg-success-subtle text-success border-success' : 'bg-danger-subtle text-danger border-danger'}`}>
                          {inv.status?.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* POSSESSION REGISTRY */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 mb-4 border-top border-4 border-info">
            <h6 className="fw-bold text-uppercase small text-muted mb-4 ls-1">Unit Handover Registry</h6>
            <Row className="g-3">
                {[
                    { label: 'Electricity Card', val: lease?.electricity_card_given, icon: 'bi-lightning' },
                    { label: 'Gas Card', val: lease?.gas_card_given, icon: 'bi-fuel-pump' },
                    { label: 'Agreement Paper', val: lease?.agreement_paper_given, icon: 'bi-file-earmark-text' },
                    { label: 'Police Verification', val: lease?.police_verification_done, icon: 'bi-shield-check' }
                ].map((item, idx) => (
                    <Col key={idx} xs={6} md={3}>
                        <div className={`p-3 rounded-4 border text-center h-100 transition-all ${item.val ? 'bg-success bg-opacity-10 border-success border-opacity-25 text-success' : 'bg-light text-muted border-light opacity-50'}`}>
                            <i className={`bi ${item.val ? 'bi-check-square-fill' : item.icon} fs-4 d-block mb-2`}></i>
                            <div style={{fontSize: '0.6rem'}} className="fw-bold text-uppercase ls-1">{item.label}</div>
                        </div>
                    </Col>
                ))}
            </Row>
          </div>
        </Col>

        {/* 4. FINANCIAL BREAKDOWN SIDEBAR */}
        <Col lg={4}>
          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-4 h-100">
            <h6 className="text-primary fw-bold text-uppercase mb-4 small ls-1 border-bottom border-secondary pb-2">
                <i className="bi bi-info-circle me-2"></i>Fixed Monthly Breakdown
            </h6>
            <ListGroup variant="flush" className="bg-transparent mb-4">
                {lease?.lease_rents?.map((rent: any) => (
                    <ListGroup.Item key={rent.id} className="bg-transparent text-white border-secondary border-opacity-25 px-0 d-flex justify-content-between py-3">
                        <span className="text-white text-opacity-50 x-small fw-bold text-uppercase ls-1">{rent.rent_type_name}</span>
                        <span className="fw-bold small font-monospace">৳{Number(rent.amount).toLocaleString()}</span>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <div className="mt-auto p-4 bg-primary bg-opacity-10 rounded-4 text-center border border-primary border-opacity-25 shadow-inner">
                <div className="x-small text-white text-opacity-50 text-uppercase fw-bold mb-2 ls-1">Consolidated Monthly Total</div>
                <div className="h2 fw-bold mb-0 text-primary font-monospace">
                    ৳{Number(lease?.rent_amount || 0).toLocaleString()}
                </div>
            </div>

            <div className="mt-4 vstack gap-2">
                <Link href="/renter-dashboard/unit" passHref legacyBehavior>
                    <Button variant="outline-light" className="rounded-pill fw-bold py-2 x-small ls-1">
                        <i className="bi bi-house-door me-2"></i>VIEW UNIT SPECIFICATIONS
                    </Button>
                </Link>
                <Link href="/renter-dashboard/complaints" passHref legacyBehavior>
                    <Button variant="primary" className="rounded-pill fw-bold py-2 x-small ls-1 shadow-sm">
                        <i className="bi bi-tools me-2"></i>INITIATE MAINTENANCE
                    </Button>
                </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}