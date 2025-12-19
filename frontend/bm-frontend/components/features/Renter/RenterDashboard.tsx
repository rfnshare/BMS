import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { LeaseService } from "../../../logic/services/leaseService"; //
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import Link from "next/link";
import { Badge, Row, Col, ListGroup } from "react-bootstrap";

export default function RenterDashboard() {
  const [lease, setLease] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch active lease using the verified service
      const activeLease = await LeaseService.getMyActiveLease();
      setLease(activeLease);

      // 2. Fetch all invoices from the general endpoint
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
    <div className="text-center py-5 my-5">
      <div className="spinner-border text-primary"></div>
      <p className="mt-2 text-muted small">Synchronizing residency data...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn p-2">

      {/* 1. TOP STATS ROW - Mapped to Real Data Keys */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-danger border-4 bg-white">
            <div className="text-muted small fw-bold text-uppercase mb-1">Due Amount</div>
            {/* current_balance is used to show the outstanding amount */}
            <div className="h2 fw-bold mb-0 text-danger">
                ৳{Number(lease?.current_balance || 0).toLocaleString()}
            </div>
          </div>
        </Col>

        <Col md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-primary border-4 bg-white">
            <div className="text-muted small fw-bold text-uppercase mb-1">Security Deposit</div>
            {/* security_deposit is pulled directly from the lease object */}
            <div className="h2 fw-bold mb-0 text-primary">
                ৳{Number(lease?.security_deposit || 0).toLocaleString()}
            </div>
            <Badge bg={lease?.deposit_status === 'paid' ? 'success' : 'warning'} className="mt-2 text-capitalize">
                {lease?.deposit_status || 'Pending'}
            </Badge>
          </div>
        </Col>

        <Col md={4}>
          <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-success border-4 bg-white">
            <div className="text-muted small fw-bold text-uppercase mb-1">Lease Status</div>
            <div className="h2 fw-bold mb-0 text-success text-capitalize">{lease?.status || 'Active'}</div>
            <div className="small text-muted mt-1">
                {/* start_date is parsed to prevent NaN errors */}
                Started {lease?.start_date ? new Date(lease.start_date).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* 2. RECENT ACTIVITY & POSSESSION */}
        <Col lg={8}>
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
            <div className="card-header bg-white border-0 p-4">
              <h5 className="fw-bold mb-0">Recent Billing Activity</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light small text-muted">
                  <tr>
                    <th className="ps-4">Inv #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th className="pe-4 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 5).map(inv => (
                    <tr key={inv.id}>
                      <td className="ps-4 py-3 fw-bold small text-primary">{inv.invoice_number}</td>
                      <td className="small">{inv.invoice_date}</td>
                      <td className="fw-bold">৳{Number(inv.amount).toLocaleString()}</td>
                      <td className="pe-4 text-end">
                        <Badge pill bg={inv.status === 'paid' ? 'success' : 'danger'}>
                          {inv.status?.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* POSSESSION CHECKLIST - Using Real Booleans */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <h6 className="fw-bold text-uppercase small text-muted mb-3">Possession Checklist</h6>
            <Row className="g-2 text-center">
                {[
                    { label: 'Elec Card', val: lease?.electricity_card_given },
                    { label: 'Gas Card', val: lease?.gas_card_given },
                    { label: 'Agreement', val: lease?.agreement_paper_given },
                    { label: 'Police Ver.', val: lease?.police_verification_done }
                ].map((item, idx) => (
                    <Col key={idx} xs={6} md={3}>
                        <div className={`p-2 rounded-3 border ${item.val ? 'bg-success-subtle border-success text-success' : 'bg-light text-muted border-light'}`}>
                            <i className={`bi bi-${item.val ? 'check-circle-fill' : 'dash-circle'} d-block mb-1`}></i>
                            <span style={{fontSize: '0.65rem'}} className="fw-bold text-uppercase">{item.label}</span>
                        </div>
                    </Col>
                ))}
            </Row>
          </div>
        </Col>

        {/* 3. MONTHLY BREAKDOWN - Iterating lease_rents */}
        <Col lg={4}>
          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-4 h-100 shadow-lg">
            <h6 className="text-warning fw-bold text-uppercase mb-4 small ls-1">Lease Breakdown</h6>
            <ListGroup variant="flush" className="bg-transparent mb-4">
                {lease?.lease_rents?.map((rent: any) => (
                    <ListGroup.Item key={rent.id} className="bg-transparent text-white border-secondary border-opacity-25 px-0 d-flex justify-content-between">
                        <span className="opacity-75 small">{rent.rent_type_name}</span>
                        <span className="fw-bold">৳{Number(rent.amount).toLocaleString()}</span>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <div className="mt-auto p-3 bg-white bg-opacity-10 rounded-4 text-center border border-secondary border-opacity-25">
                <div className="small opacity-50 text-uppercase fw-bold mb-1">Total Fixed Monthly</div>
                {/* rent_amount is used to show the combined total */}
                <div className="h3 fw-bold mb-0 text-warning">
                    ৳{Number(lease?.rent_amount || 0).toLocaleString()}
                </div>
            </div>

            <div className="mt-4 vstack gap-2">
                <Link href="/renter-dashboard/unit" className="btn btn-outline-light btn-sm rounded-pill fw-bold">Full Details</Link>
                <Link href="/renter-dashboard/complaints" className="btn btn-warning btn-sm rounded-pill fw-bold text-dark">Get Help</Link>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}