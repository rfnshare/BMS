import { useEffect, useState } from "react";
import { ReportService } from "../../../logic/services/reportService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, ProgressBar, Badge, Row, Col, Card, Container } from "react-bootstrap";

export default function ReportManager() {
  const [activeTab, setActiveTab] = useState<'financial' | 'occupancy' | 'renters'>('financial');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const [finSum, finInv, occSum, occVac, renCol, renDue] = await Promise.all([
        ReportService.getFinancialSummary(),
        ReportService.getFinancialInvoices({ page: 1 }),
        ReportService.getOccupancySummary(),
        ReportService.getVacantUnits({ page: 1 }),
        ReportService.getRenterCollection(),
        ReportService.getTopDues()
      ]);

      setData({
        financial: { summary: finSum, invoices: finInv.results },
        occupancy: { summary: occSum, vacant: occVac.results },
        renters: { collection: renCol, dues: renDue }
      });
    } catch (error) {
      console.error("Report Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAllReports(); }, []);

  if (loading) return (
    <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center bg-light">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted fw-bold small text-uppercase">Analyzing Performance...</p>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* 1. STICKY DUAL-HEADER
          Stays sticky under Topbar (70px). mx-n3 makes it full-width on mobile.
      */}
      <div className="bg-white border-bottom shadow-sm sticky-top mx-n3 px-3 py-3 mb-3"
           style={{ zIndex: 1020, top: '70px' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="text-center text-md-start">
            <h5 className="fw-bold text-dark mb-0">Analytics Hub</h5>
            <div className="text-muted fw-bold small">Live Dashboard</div>
          </div>

          {/* SWIPEABLE TABS */}
          <div className="d-flex bg-light p-1 rounded-pill overflow-auto no-scrollbar flex-nowrap w-100 w-md-auto">
            {['financial', 'occupancy', 'renters'].map((tab: any) => (
              <button
                key={tab}
                className={`btn rounded-pill px-4 btn-sm fw-bold border-0 text-nowrap flex-grow-1 ${activeTab === tab ? 'bg-dark text-white shadow-sm' : 'text-muted'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Container fluid className="px-2 px-md-4">
        {/* 2. FINANCIAL TAB (REFINED) */}
        {activeTab === 'financial' && (
          <div className="animate__animated animate__fadeIn">
            <Row className="row-cols-1 row-cols-md-3 g-2 g-md-3 mb-3">
              <Col>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                  <div className="x-small text-muted text-uppercase fw-bold mb-1">Total Invoiced</div>
                  <div className="h4 fw-bold text-dark mb-0">৳{Number(data.financial.summary.total_invoiced).toLocaleString()}</div>
                  <div className="x-small text-primary fw-bold mt-1">{data.financial.summary.invoice_count} Records</div>
                </Card>
              </Col>
              <Col>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success h-100">
                  <div className="x-small text-muted text-uppercase fw-bold mb-1">Collected</div>
                  <div className="h4 fw-bold text-success mb-0">৳{Number(data.financial.summary.total_collected).toLocaleString()}</div>
                  <div className="x-small text-muted mt-1">Eff: {((data.financial.summary.total_collected / data.financial.summary.total_invoiced) * 100).toFixed(1)}%</div>
                </Card>
              </Col>
              <Col>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger h-100">
                  <div className="x-small text-muted text-uppercase fw-bold mb-1">Outstanding</div>
                  <div className="h4 fw-bold text-danger mb-0">৳{Number(data.financial.summary.total_outstanding).toLocaleString()}</div>
                  <div className="x-small text-danger fw-bold mt-1"><i className="bi bi-exclamation-triangle"></i> Follow up</div>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="card-header bg-white p-3 fw-bold border-bottom small text-muted">LATEST BILLING</div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-nowrap">
                  <thead className="bg-light x-small text-muted text-uppercase">
                    <tr><th className="ps-3">Ref</th><th>Resident</th><th>Amt</th><th className="pe-3">Status</th></tr>
                  </thead>
                  <tbody className="small">
                    {data.financial.invoices.map((inv: any) => (
                      <tr key={inv.id}>
                        <td className="ps-3 fw-bold text-primary">#{inv.invoice_number}</td>
                        <td>
                          <div className="fw-bold text-dark">{inv.renter}</div>
                          <div className="x-small text-muted">{inv.unit}</div>
                        </td>
                        <td className="fw-bold">৳{Number(inv.amount).toLocaleString()}</td>
                        <td className="pe-3">
                          <Badge pill bg={inv.status === 'paid' ? 'success' : 'danger'} className="x-small px-2">
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

        {/* 3. OCCUPANCY TAB (REFINED) */}
        {activeTab === 'occupancy' && (
          <div className="animate__animated animate__fadeIn">
            <Row className="g-3">
              <Col xs={12} lg={4}>
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white text-center h-100">
                  <div className="small text-muted text-uppercase fw-bold mb-3">Live Capacity</div>
                  <h1 className="display-4 fw-bold text-primary mb-1">{data.occupancy.summary.occupancy_rate}%</h1>
                  <ProgressBar now={data.occupancy.summary.occupancy_rate} variant="primary" className="mb-4 shadow-sm" style={{height: '12px', borderRadius: '10px'}} />
                  <div className="d-flex justify-content-around border-top pt-3">
                     <div className="text-center"><div className="fw-bold small">{data.occupancy.summary.total_units}</div><div className="x-small text-muted">TOTAL</div></div>
                     <div className="text-center"><div className="fw-bold text-success small">{data.occupancy.summary.occupied_units}</div><div className="x-small text-muted">LIVE</div></div>
                     <div className="text-center"><div className="fw-bold text-danger small">{data.occupancy.summary.vacant_units}</div><div className="x-small text-muted">EMPTY</div></div>
                  </div>
                </Card>
              </Col>

              <Col xs={12} lg={8}>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
                  <div className="card-header bg-white p-3 fw-bold border-bottom text-primary small">AVAILABLE UNITS</div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap">
                      <thead className="bg-light x-small text-muted text-uppercase">
                        <tr><th className="ps-3">Unit</th><th>Floor</th><th>Type</th><th>Market Rent</th></tr>
                      </thead>
                      <tbody className="small">
                        {data.occupancy.vacant.map((u: any) => (
                          <tr key={u.id}>
                            <td className="ps-3 fw-bold text-dark">{u.name}</td>
                            <td>{u.floor_name}</td>
                            <td><span className="badge bg-light text-dark border x-small">{u.unit_type.toUpperCase()}</span></td>
                            <td className="fw-bold text-success">৳{Number(u.monthly_rent).toLocaleString()}</td>
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

        {/* 4. RENTERS TAB (REMAINING FIELD INTEGRITY) */}
        {activeTab === 'renters' && (
          <div className="animate__animated animate__fadeIn">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white border-top border-4 border-danger">
                  <div className="card-header bg-white p-3 fw-bold small text-danger">CRITICAL DUES</div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap">
                      <thead className="bg-light x-small text-muted text-uppercase">
                        <tr><th className="ps-3">Resident</th><th className="text-end pe-3">Balance</th></tr>
                      </thead>
                      <tbody className="small">
                        {data.renters.dues.map((ren: any) => (
                          <tr key={ren.renter_id}>
                            <td className="ps-3">
                              <div className="fw-bold text-dark">{ren.full_name}</div>
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
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white border-top border-4 border-success">
                  <div className="card-header bg-white p-3 fw-bold small text-success">COLLECTION STATS</div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap">
                      <thead className="bg-light x-small text-muted text-uppercase">
                        <tr><th className="ps-3">Resident</th><th className="text-end pe-3">Paid / Status</th></tr>
                      </thead>
                      <tbody className="small">
                        {data.renters.collection.map((ren: any) => (
                          <tr key={ren.renter_id}>
                            <td className="ps-3">
                              <div className="fw-bold text-dark">{ren.full_name}</div>
                              <div className="x-small text-muted">{ren.phone_number}</div>
                            </td>
                            <td className="text-end pe-3 fw-bold">
                              <div className="text-success">৳{Number(ren.total_paid).toLocaleString()}</div>
                              <div className={Number(ren.total_due) < 0 ? "text-primary x-small" : "text-danger x-small"}>
                                  {Number(ren.total_due) < 0 ? "ADVANCE" : `DUE: ৳${Number(ren.total_due).toLocaleString()}`}
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
      </Container>
    </div>
  );
}