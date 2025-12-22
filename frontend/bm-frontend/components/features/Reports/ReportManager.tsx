import { useState } from "react";
import { useReports } from "../../../logic/hooks/useReports";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, ProgressBar, Badge, Row, Col, Card } from "react-bootstrap";

export default function ReportManager() {
  const { error: notifyError } = useNotify();
  const { data, loading, refresh } = useReports();
  const [activeTab, setActiveTab] = useState<'financial' | 'occupancy' | 'renters'>('financial');

  if (loading) return (
    <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center bg-light">
      <Spinner animation="grow" variant="primary" />
      <p className="mt-3 text-muted fw-bold x-small text-uppercase ls-1">Analyzing Building Data...</p>
    </div>
  );

  return (
    <div className="p-2 p-md-4 bg-light min-vh-100 animate__animated animate__fadeIn">

      {/* 1. DASHBOARD HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-0">Analytics Dashboard</h4>
          <p className="text-muted x-small mb-0 text-uppercase fw-bold">Live Stats since {data.financial?.summary?.start_date}</p>
        </div>

        {/* TAB NAVIGATION */}
        <div className="btn-group bg-white p-1 rounded-pill shadow-sm overflow-auto no-scrollbar">
          {['financial', 'occupancy', 'renters'].map((tab: any) => (
            <button
              key={tab}
              className={`btn rounded-pill px-3 px-md-4 btn-sm fw-bold border-0 ${activeTab === tab ? 'btn-primary text-white shadow-sm' : 'text-muted'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
          <button className="btn btn-light rounded-pill ms-1" onClick={refresh}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {/* 2. FINANCIAL VIEW */}
      {activeTab === 'financial' && (
        <div className="animate__animated animate__fadeIn">
          <Row className="g-3 mb-4">
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm rounded-4 p-3 border-start border-4 border-primary">
                <div className="x-small text-muted text-uppercase fw-bold mb-1">Total Invoiced</div>
                <div className="h3 fw-bold text-dark mb-0">৳{Number(data.financial.summary.total_invoiced).toLocaleString()}</div>
                <div className="x-small text-muted mt-1 fw-bold">{data.financial.summary.invoice_count} Billings Issued</div>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm rounded-4 p-3 border-start border-4 border-success">
                <div className="x-small text-muted text-uppercase fw-bold mb-1">Total Collected</div>
                <div className="h3 fw-bold text-success mb-0">৳{Number(data.financial.summary.total_collected).toLocaleString()}</div>
                <div className="x-small text-success fw-bold mt-1">
                    Efficiency: {((data.financial.summary.total_collected / data.financial.summary.total_invoiced) * 100).toFixed(1)}%
                </div>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm rounded-4 p-3 border-start border-4 border-danger">
                <div className="x-small text-muted text-uppercase fw-bold mb-1">Outstanding Balance</div>
                <div className="h3 fw-bold text-danger mb-0">৳{Number(data.financial.summary.total_outstanding).toLocaleString()}</div>
                <div className="x-small text-danger fw-bold mt-1 animate__animated animate__flash animate__infinite"><i className="bi bi-exclamation-triangle-fill me-1"></i>Risk Detected</div>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
             <div className="card-header bg-white p-3 fw-bold border-bottom x-small text-uppercase text-muted ls-1">Latest Billing Logs</div>
             <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                   <thead className="bg-light x-small text-muted text-uppercase">
                      <tr><th className="ps-3">Invoice</th><th>Renter</th><th>Amount</th><th>Status</th></tr>
                   </thead>
                   <tbody>
                      {data.financial.invoices.map((inv: any) => (
                        <tr key={inv.id}>
                          <td className="ps-3 fw-bold small">#{inv.invoice_number}</td>
                          <td>
                            <div className="small fw-bold">{inv.renter}</div>
                            <div className="x-small text-muted">{inv.unit}</div>
                          </td>
                          <td className="small fw-bold">৳{Number(inv.amount).toLocaleString()}</td>
                          <td>
                            <Badge pill className={`x-small px-3 ${inv.status === 'paid' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                                {inv.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </Card>
        </div>
      )}

      {/* 3. OCCUPANCY VIEW */}
      {activeTab === 'occupancy' && (
        <div className="animate__animated animate__fadeIn">
          <Row className="g-3">
             <Col xs={12} lg={4}>
                <Card className="border-0 shadow-sm rounded-4 p-4 h-100 text-center">
                    <div className="x-small text-muted text-uppercase fw-bold mb-4 ls-1">Utilization Rate</div>
                    <div className="mb-3">
                        <h1 className="display-3 fw-bold text-primary mb-0">{data.occupancy.summary.occupancy_rate}%</h1>
                        <p className="text-muted small fw-bold">Active Occupancy</p>
                    </div>
                    <ProgressBar now={data.occupancy.summary.occupancy_rate} variant="primary" className="mb-4 rounded-pill" style={{height: '12px'}} />
                    <div className="d-flex justify-content-around border-top pt-3">
                        <div>
                            <div className="fw-bold">{data.occupancy.summary.total_units}</div>
                            <div className="x-small text-muted">UNITS</div>
                        </div>
                        <div className="border-start ps-4">
                            <div className="fw-bold text-success">{data.occupancy.summary.occupied_units}</div>
                            <div className="x-small text-muted">LIVE</div>
                        </div>
                        <div className="border-start ps-4">
                            <div className="fw-bold text-danger">{data.occupancy.summary.vacant_units}</div>
                            <div className="x-small text-muted">VACANT</div>
                        </div>
                    </div>
                </Card>
             </Col>
             <Col xs={12} lg={8}>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                    <div className="card-header bg-white p-3 fw-bold border-bottom x-small text-uppercase text-primary ls-1">Revenue Potential (Vacant Units)</div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light x-small text-muted">
                                <tr><th className="ps-3">Unit</th><th>Floor</th><th>Rent Value</th></tr>
                            </thead>
                            <tbody>
                                {data.occupancy.vacant.map((u: any) => (
                                    <tr key={u.id}>
                                        <td className="ps-3 fw-bold small">{u.name}</td>
                                        <td className="small">{u.floor_name}</td>
                                        <td className="fw-bold text-success small">৳{Number(u.monthly_rent).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
             </Col>
          </Row>
        </div>
      )}

      {/* 4. RENTER VIEW (Collection & Dues) */}
      {activeTab === 'renters' && (
        <div className="animate__animated animate__fadeIn">
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-danger text-white p-3 fw-bold border-0 x-small text-uppercase ls-1">Top Debtors (Critical)</div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light x-small text-muted">
                      <tr><th className="ps-3">Renter</th><th className="text-end pe-3">Total Due</th></tr>
                    </thead>
                    <tbody>
                      {data.renters.dues.map((ren: any) => (
                        <tr key={ren.renter_id}>
                          <td className="ps-3">
                            <div className="fw-bold small">{ren.full_name}</div>
                            <div className="x-small text-muted">{ren.phone_number}</div>
                          </td>
                          <td className="text-end pe-3 fw-bold text-danger">৳{Number(ren.total_due).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>

            <Col xs={12} md={6}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-success text-white p-3 fw-bold border-0 x-small text-uppercase ls-1">Collection Performance</div>
                <div className="table-responsive" style={{maxHeight: '400px'}}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light x-small text-muted">
                      <tr><th className="ps-3">Renter</th><th className="text-end pe-3">Paid vs Due</th></tr>
                    </thead>
                    <tbody>
                      {data.renters.collection.map((ren: any) => (
                        <tr key={ren.renter_id}>
                          <td className="ps-3">
                            <div className="fw-bold small">{ren.full_name}</div>
                            <div className="x-small text-muted">{ren.phone_number}</div>
                          </td>
                          <td className="text-end pe-3">
                            <div className="text-success fw-bold small">৳{Number(ren.total_paid).toLocaleString()}</div>
                            <div className={`x-small fw-bold ${Number(ren.total_due) > 0 ? 'text-danger' : 'text-primary'}`}>
                                {Number(ren.total_due) > 0 ? `Due: ৳${Number(ren.total_due).toLocaleString()}` : 'Advance'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}