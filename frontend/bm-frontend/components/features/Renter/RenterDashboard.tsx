import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { LeaseService } from "../../../logic/services/leaseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import Link from "next/link";
import { Badge, Row, Col, ListGroup, Spinner, Container } from "react-bootstrap";

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
      const invRes = await api.get("/invoices/");
      setInvoices(invRes.data.results || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted fw-bold small text-uppercase">Synchronizing residency data...</p>
    </div>
  );

  return (
    <Container fluid className="p-2 p-md-0 animate__animated animate__fadeIn">

      {/* 1. EXECUTIVE KPI SECTION
          Due Amount is full-width (xs=12) to catch attention immediately.
      */}
      <Row className="g-2 g-md-3 mb-4">
        <Col xs={12} md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 border-start border-danger border-5 bg-white">
            <div className="text-muted fw-bold text-uppercase mb-1" style={{fontSize: '0.7rem'}}>Due Amount</div>
            <div className="h1 fw-bold mb-0 text-danger">
                ৳{Number(lease?.current_balance || 0).toLocaleString()}
            </div>
            {Number(lease?.current_balance) > 0 && (
                <div className="text-danger x-small fw-bold mt-1">
                    <i className="bi bi-exclamation-circle-fill me-1"></i> Overdue payment
                </div>
            )}
          </div>
        </Col>

        <Col xs={6} md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 border-start border-primary border-4 bg-white h-100">
            <div className="text-muted fw-bold text-uppercase mb-1" style={{fontSize: '0.6rem'}}>Deposit</div>
            <div className="h4 fw-bold mb-0 text-primary">
                ৳{Number(lease?.security_deposit || 0).toLocaleString()}
            </div>
            <Badge bg={lease?.deposit_status === 'paid' ? 'success' : 'warning'} className="mt-2 x-small">
                {lease?.deposit_status || 'Pending'}
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
        {/* 2. MAIN CONTENT AREA */}
        <Col lg={8}>
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
            <div className="card-header bg-white border-0 pt-4 px-3 px-md-4">
              <h5 className="fw-bold mb-0">Billing History</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-nowrap">
                <thead className="bg-light x-small text-muted text-uppercase">
                  <tr>
                    <th className="ps-3 ps-md-4">Inv #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th className="pe-3 pe-md-4 text-end">Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {invoices.slice(0, 5).map(inv => (
                    <tr key={inv.id}>
                      <td className="ps-3 ps-md-4 py-3 fw-bold text-primary">#{inv.invoice_number?.split('-').pop()}</td>
                      <td>{inv.invoice_date}</td>
                      <td className="fw-bold">৳{Number(inv.amount).toLocaleString()}</td>
                      <td className="pe-3 pe-md-4 text-end">
                        <Badge pill bg={inv.status === 'paid' ? 'success' : 'danger'} className="x-small">
                          {inv.status?.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* POSSESSION CHECKLIST (2x2 Grid on Mobile) */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 mb-4">
            <h6 className="fw-bold text-uppercase small text-muted mb-3">Unit Handover Status</h6>
            <Row className="g-2">
                {[
                    { label: 'Electricity', val: lease?.electricity_card_given },
                    { label: 'Gas Card', val: lease?.gas_card_given },
                    { label: 'Agreement', val: lease?.agreement_paper_given },
                    { label: 'Police Ver.', val: lease?.police_verification_done }
                ].map((item, idx) => (
                    <Col key={idx} xs={6} md={3}>
                        <div className={`p-3 rounded-4 border text-center h-100 ${item.val ? 'bg-success-subtle border-success text-success' : 'bg-light text-muted border-light'}`}>
                            <i className={`bi bi-${item.val ? 'check-circle-fill' : 'dash-circle'} fs-5 d-block mb-1`}></i>
                            <div style={{fontSize: '0.65rem'}} className="fw-bold text-uppercase">{item.label}</div>
                        </div>
                    </Col>
                ))}
            </Row>
          </div>
        </Col>

        {/* 3. FIXED MONTHLY BREAKDOWN */}
        <Col lg={4}>
          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-4 h-100 shadow-lg">
            <h6 className="text-warning fw-bold text-uppercase mb-4 small ls-1">Financial Breakdown</h6>
            <ListGroup variant="flush" className="bg-transparent mb-4">
                {lease?.lease_rents?.map((rent: any) => (
                    <ListGroup.Item key={rent.id} className="bg-transparent text-white border-secondary border-opacity-25 px-0 d-flex justify-content-between py-2">
                        <span className="opacity-75 small">{rent.rent_type_name}</span>
                        <span className="fw-bold small">৳{Number(rent.amount).toLocaleString()}</span>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <div className="mt-auto p-3 bg-white bg-opacity-10 rounded-4 text-center border border-secondary border-opacity-25">
                <div className="small opacity-50 text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Fixed Monthly Total</div>
                <div className="h2 fw-bold mb-0 text-warning">
                    ৳{Number(lease?.rent_amount || 0).toLocaleString()}
                </div>
            </div>

            <div className="mt-4 vstack gap-2">
                <Link href="/renter-dashboard/unit" className="btn btn-outline-light rounded-pill fw-bold py-2">
                    <i className="bi bi-house-door me-2"></i>Unit Details
                </Link>
                <Link href="/renter-dashboard/complaints" className="btn btn-warning rounded-pill fw-bold text-dark py-2">
                    <i className="bi bi-chat-dots me-2"></i>Request Maintenance
                </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}