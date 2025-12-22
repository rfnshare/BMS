import { useState, useMemo } from "react";
import { useReports } from "../../../logic/hooks/useReports";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, ProgressBar, Badge, Row, Col, Card, Button } from "react-bootstrap";

export default function ReportManager() {
  const { error: notifyError } = useNotify();
  const { data, loading, refresh } = useReports();
  const [activeTab, setActiveTab] = useState<'financial' | 'occupancy' | 'renters'>('financial');

  if (loading) return (
    <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center bg-light">
      <Spinner animation="grow" variant="primary" size="sm" />
      <p className="mt-3 text-muted fw-bold x-small text-uppercase ls-1">Analyzing Building Infrastructure...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn pb-5">

      {/* 1. INDUSTRIAL HEADER (Blueprint DNA) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">

            {/* Identity Block */}
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
                <i className="bi bi-graph-up-arrow fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Analytics Engine</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">
                    Operational Insights since {data.financial?.summary?.start_date || 'Inception'}
                </p>
              </div>
            </div>

            {/* Navigation & Refresh Actions (Right Aligned) */}
            <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
                <div className="btn-group bg-light p-1 rounded-pill border overflow-auto no-scrollbar flex-grow-1 flex-md-grow-0">
                    {['financial', 'occupancy', 'renters'].map((tab: any) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'primary' : 'transparent'}
                            className={`rounded-pill px-3 px-md-4 fw-bold x-small ls-1 border-0 ${activeTab === tab ? 'shadow-sm text-white' : 'text-muted'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.toUpperCase()}
                        </Button>
                    ))}
                </div>
                <Button variant="light" className="rounded-circle border p-2 shadow-sm" onClick={refresh}>
                    <i className="bi bi-arrow-clockwise text-primary"></i>
                </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC CONTENT AREA */}
      <div className="animate__animated animate__fadeIn">

        {/* --- FINANCIAL INTELLIGENCE --- */}
        {activeTab === 'financial' && (
          <>
            <Row className="g-3 mb-4">
              {[
                { label: "Gross Invoiced", val: data.financial.summary.total_invoiced, color: "primary", meta: `${data.financial.summary.invoice_count} Records`, icon: "bi-receipt" },
                { label: "Revenue Collected", val: data.financial.summary.total_collected, color: "success", meta: `Efficiency: ${((data.financial.summary.total_collected / data.financial.summary.total_invoiced) * 100).toFixed(1)}%`, icon: "bi-cash-coin" },
                { label: "Total Outstanding", val: data.financial.summary.total_outstanding, color: "danger", meta: "Action Required", icon: "bi-exclamation-octagon" }
              ].map((s, i) => (
                <Col key={i} xs={12} md={4}>
                  <Card className={`border-0 shadow-sm rounded-4 p-3 border-start border-4 border-${s.color} bg-white h-100`}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                        <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                        <i className={`bi ${s.icon} text-${s.color} opacity-25`}></i>
                    </div>
                    <div className={`h3 fw-bold mb-1 text-${s.color === 'primary' ? 'dark' : s.color} font-monospace`}>
                        ৳{Number(s.val).toLocaleString()}
                    </div>
                    <div className={`x-small fw-bold ls-1 text-uppercase ${s.color === 'danger' ? 'text-danger animate__animated animate__flash animate__infinite' : 'text-muted opacity-75'}`}>
                        {s.meta}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-light p-3 fw-bold x-small text-uppercase text-muted ls-1 border-bottom">
                    Latest Ledger Activity
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-white border-bottom">
                            <tr className="text-muted x-small fw-bold text-uppercase ls-1">
                                <th className="ps-4 py-3">Audit ID</th>
                                <th>Allocation</th>
                                <th>Amount</th>
                                <th className="pe-4 text-end">Settlement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.financial.invoices.map((inv: any) => (
                                <tr key={inv.id}>
                                    <td className="ps-4 fw-bold text-dark small font-monospace">#{inv.invoice_number}</td>
                                    <td>
                                        <div className="small fw-bold text-primary">{inv.renter}</div>
                                        <div className="text-muted x-small fw-bold ls-1 text-uppercase">{inv.unit}</div>
                                    </td>
                                    <td className="small fw-bold font-monospace">৳{Number(inv.amount).toLocaleString()}</td>
                                    <td className="pe-4 text-end">
                                        <Badge pill className={`x-small px-3 py-2 fw-bold ls-1 border ${inv.status === 'paid' ? 'bg-success-subtle text-success border-success' : 'bg-danger-subtle text-danger border-danger'}`}>
                                            {inv.status.toUpperCase()}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
          </>
        )}

        {/* --- OCCUPANCY & UTILIZATION --- */}
        {activeTab === 'occupancy' && (
          <Row className="g-4">
             <Col xs={12} lg={4}>
                <Card className="border-0 shadow-sm rounded-4 p-4 h-100 text-center bg-white border-top border-4 border-primary">
                    <div className="x-small text-muted text-uppercase fw-bold mb-4 ls-1">Physical Utilization Rate</div>
                    <div className="position-relative d-inline-block mb-4">
                        <h1 className="display-3 fw-bold text-dark mb-0">{data.occupancy.summary.occupancy_rate}%</h1>
                        <p className="text-muted small fw-bold text-uppercase ls-1 opacity-75">Live Capacity</p>
                    </div>
                    <ProgressBar now={data.occupancy.summary.occupancy_rate} variant="primary" className="mb-4 rounded-pill shadow-sm" style={{height: '14px'}} />
                    <div className="d-flex justify-content-around border-top pt-4">
                        <div>
                            <div className="h5 fw-bold mb-0 text-dark">{data.occupancy.summary.total_units}</div>
                            <div className="x-small text-muted fw-bold ls-1 text-uppercase">Total</div>
                        </div>
                        <div className="border-start ps-4">
                            <div className="h5 fw-bold mb-0 text-success">{data.occupancy.summary.occupied_units}</div>
                            <div className="x-small text-muted fw-bold ls-1 text-uppercase">Occupied</div>
                        </div>
                        <div className="border-start ps-4">
                            <div className="h5 fw-bold mb-0 text-danger">{data.occupancy.summary.vacant_units}</div>
                            <div className="x-small text-muted fw-bold ls-1 text-uppercase">Vacant</div>
                        </div>
                    </div>
                </Card>
             </Col>
             <Col xs={12} lg={8}>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
                    <div className="card-header bg-primary bg-opacity-10 p-3 fw-bold border-bottom x-small text-uppercase text-primary ls-1">
                        Revenue Recovery Opportunity (Vacant)
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light x-small fw-bold text-muted text-uppercase ls-1">
                                <tr><th className="ps-4">Asset Name</th><th>Designation</th><th className="pe-4 text-end">Lease Potential</th></tr>
                            </thead>
                            <tbody>
                                {data.occupancy.vacant.map((u: any) => (
                                    <tr key={u.id}>
                                        <td className="ps-4 fw-bold text-dark small">{u.name}</td>
                                        <td className="small text-muted fw-bold text-uppercase ls-1" style={{fontSize: '0.65rem'}}>{u.floor_name}</td>
                                        <td className="pe-4 text-end fw-bold text-success small font-monospace">৳{Number(u.monthly_rent).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
             </Col>
          </Row>
        )}

        {/* --- DEBT & COLLECTION AUDIT --- */}
        {activeTab === 'renters' && (
          <Row className="g-4">
            <Col xs={12} md={6}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white border-top border-4 border-danger">
                <div className="card-header bg-white p-3 fw-bold border-0 x-small text-uppercase text-danger ls-1">
                    <i className="bi bi-shield-exclamation me-2"></i>High-Risk Accounts (Dues)
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light x-small fw-bold text-muted text-uppercase ls-1">
                      <tr><th className="ps-4">Resident Identity</th><th className="text-end pe-4">Total Arrears</th></tr>
                    </thead>
                    <tbody>
                      {data.renters.dues.map((ren: any) => (
                        <tr key={ren.renter_id}>
                          <td className="ps-4">
                            <div className="fw-bold small text-dark">{ren.full_name}</div>
                            <div className="text-muted x-small fw-bold font-monospace">{ren.phone_number}</div>
                          </td>
                          <td className="text-end pe-4 fw-bold text-danger font-monospace">৳{Number(ren.total_due).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>

            <Col xs={12} md={6}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white border-top border-4 border-success">
                <div className="card-header bg-white p-3 fw-bold border-0 x-small text-uppercase text-success ls-1">
                    <i className="bi bi-piggy-bank me-2"></i>Collection Performance
                </div>
                <div className="table-responsive" style={{maxHeight: '500px'}}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light x-small fw-bold text-muted text-uppercase ls-1">
                      <tr><th className="ps-4">Resident Identity</th><th className="text-end pe-4">Paid vs Balance</th></tr>
                    </thead>
                    <tbody>
                      {data.renters.collection.map((ren: any) => (
                        <tr key={ren.renter_id}>
                          <td className="ps-4">
                            <div className="fw-bold small text-dark">{ren.full_name}</div>
                            <div className="text-muted x-small fw-bold font-monospace opacity-75">ID: {ren.renter_id}</div>
                          </td>
                          <td className="text-end pe-4">
                            <div className="text-success fw-bold small font-monospace">৳{Number(ren.total_paid).toLocaleString()}</div>
                            <div className={`x-small fw-bold ls-1 text-uppercase ${Number(ren.total_due) > 0 ? 'text-danger' : 'text-primary'}`}>
                                {Number(ren.total_due) > 0 ? `DUE: ৳${Number(ren.total_due).toLocaleString()}` : 'Advance Settled'}
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
        )}
      </div>
    </div>
  );
}