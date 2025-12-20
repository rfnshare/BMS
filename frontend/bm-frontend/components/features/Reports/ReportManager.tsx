import { useEffect, useState } from "react";
import { ReportService } from "../../../logic/services/reportService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, ProgressBar, Badge, Row, Col, Card } from "react-bootstrap";

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
    <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted fw-medium">Analyzing your data...</p>
    </div>
  );

  return (
    <div className="p-2 p-md-4 bg-light min-vh-100">
      {/* 1. RESPONSIVE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div className="text-center text-md-start">
          <h3 className="fw-bold text-dark mb-0">Analytics Dashboard</h3>
          <p className="text-muted x-small mb-0">Live data since {data.financial?.summary?.start_date}</p>
        </div>

        {/* 🔥 MOBILE-FRIENDLY TAB BAR */}
        <div className="btn-group bg-white p-1 rounded-pill shadow-sm w-100 w-md-auto overflow-auto">
          {['financial', 'occupancy', 'renters'].map((tab: any) => (
            <button
              key={tab}
              className={`btn rounded-pill px-3 px-md-4 btn-sm fw-bold border-0 flex-grow-1 ${activeTab === tab ? 'btn-dark text-white shadow' : 'text-muted'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2. FINANCIAL FOCUS */}
      {activeTab === 'financial' && (
        <div className="animate__animated animate__fadeIn px-1">
          {/* Executive KPI Bar - Stacked on Mobile */}
          <Row className="g-2 g-md-3 mb-4">
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white">
                <div className="x-small text-muted text-uppercase fw-bold mb-1">Total Invoiced</div>
                <div className="h3 fw-bold text-dark mb-0">৳{Number(data.financial.summary.total_invoiced).toLocaleString()}</div>
                <div className="x-small text-primary fw-bold mt-1"><i className="bi bi-receipt"></i> {data.financial.summary.invoice_count} Records</div>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white border-start border-4 border-success">
                <div className="x-small text-muted text-uppercase fw-bold mb-1">Total Collected</div>
                <div className="h3 fw-bold text-success mb-0">৳{Number(data.financial.summary.total_collected).toLocaleString()}</div>
                <div className="x-small text-muted mt-1">Efficiency: {((data.financial.summary.total_collected / data.financial.summary.total_invoiced) * 100).toFixed(1)}%</div>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white border-start border-4 border-danger">
                <div className="x-small text-muted text-uppercase fw-bold mb-1">Outstanding Balance</div>
                <div className="h3 fw-bold text-danger mb-0">৳{Number(data.financial.summary.total_outstanding).toLocaleString()}</div>
                <div className="x-small text-danger fw-bold mt-1"><i className="bi bi-exclamation-circle"></i> High Risk</div>
              </Card>
            </Col>
          </Row>

          {/* Ledger Table - Scrollable on Mobile */}
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 fw-bold border-bottom">Latest Billing Activity</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ minWidth: '500px' }}>
                <thead className="bg-light x-small text-muted text-uppercase">
                  <tr><th>Invoice #</th><th>Renter</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.financial.invoices.map((inv: any) => (
                    <tr key={inv.id}>
                      <td className="ps-3 fw-bold small text-primary">{inv.invoice_number}</td>
                      <td>
                        <div className="small fw-bold">{inv.renter}</div>
                        <div className="x-small text-muted">{inv.unit}</div>
                      </td>
                      <td className="small fw-bold">৳{Number(inv.amount).toLocaleString()}</td>
                      <td>
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

      {/* 3. OCCUPANCY FOCUS */}
      {activeTab === 'occupancy' && (
        <div className="animate__animated animate__fadeIn px-1">
          <Row className="g-3">
            <Col xs={12} lg={4}>
              <Card className="border-0 shadow-sm rounded-4 p-4 h-100 bg-white text-center">
                <div className="small text-muted text-uppercase fw-bold mb-3">Building Occupancy</div>
                <div className="mb-3">
                   <h1 className="display-4 fw-bold text-primary mb-0">{data.occupancy.summary.occupancy_rate}%</h1>
                   <div className="text-muted small">Current Capacity</div>
                </div>
                <ProgressBar now={data.occupancy.summary.occupancy_rate} variant="primary" className="mb-4" style={{height: '10px'}} />
                <Row className="text-center border-top pt-3 g-0">
                   <Col xs={4} className="border-end">
                      <div className="fw-bold small">{data.occupancy.summary.total_units}</div>
                      <div className="x-small text-muted">UNITS</div>
                   </Col>
                   <Col xs={4} className="border-end">
                      <div className="fw-bold text-success small">{data.occupancy.summary.occupied_units}</div>
                      <div className="x-small text-muted">LIVE</div>
                   </Col>
                   <Col xs={4}>
                      <div className="fw-bold text-danger small">{data.occupancy.summary.vacant_units}</div>
                      <div className="x-small text-muted">EMPTY</div>
                   </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={12} lg={8}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
                <div className="card-header bg-white p-3 fw-bold border-bottom text-primary small text-uppercase">Vacant Units (Revenue Potential)</div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ minWidth: '450px' }}>
                    <thead className="bg-light x-small text-muted">
                      <tr><th>Unit Name</th><th>Floor</th><th>Type</th><th>Market Rent</th></tr>
                    </thead>
                    <tbody>
                      {data.occupancy.vacant.map((u: any) => (
                        <tr key={u.id}>
                          <td className="ps-3 fw-bold small">{u.name}</td>
                          <td className="small">{u.floor_name}</td>
                          <td><span className="badge bg-light text-dark border x-small">{u.unit_type.toUpperCase()}</span></td>
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

      {/* 4. RENTER FOCUS */}
      {activeTab === 'renters' && (
        <div className="animate__animated animate__fadeIn px-1">
          <Row className="g-3">
            {/* Top Debtors - Full Width on Mobile */}
            <Col xs={12} md={6}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-danger text-white p-3 fw-bold border-0 small text-uppercase">Critical Dues (Immediate Attention)</div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light x-small text-muted text-uppercase">
                      <tr><th>Renter</th><th className="text-end pe-3">Balance</th></tr>
                    </thead>
                    <tbody>
                      {data.renters.dues.map((ren: any) => (
                        <tr key={ren.renter_id}>
                          <td className="ps-3">
                            <div className="fw-bold small">{ren.full_name}</div>
                            <div className="x-small text-muted">{ren.phone_number}</div>
                          </td>
                          <td className="text-end pe-3 fw-bold text-danger small">৳{Number(ren.total_due).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>

            {/* Collection Performance */}
            <Col xs={12} md={6}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-success text-white p-3 fw-bold border-0 small text-uppercase">Payment Performance</div>
                <div className="table-responsive" style={{maxHeight: '400px'}}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light x-small text-muted text-uppercase">
                      <tr><th>Renter</th><th className="text-end pe-3">Paid/Due</th></tr>
                    </thead>
                    <tbody>
                      {data.renters.collection.map((ren: any) => (
                        <tr key={ren.renter_id}>
                          <td className="ps-3 small">
                            <div className="fw-bold">{ren.full_name}</div>
                            <div className="x-small text-muted">{ren.phone_number}</div>
                          </td>
                          <td className="text-end pe-3 small">
                            <div className="text-success fw-bold">৳{Number(ren.total_paid).toLocaleString()}</div>
                            <div className={Number(ren.total_due) < 0 ? "text-primary x-small fw-bold" : "text-danger x-small fw-bold"}>
                                {Number(ren.total_due) < 0 ? "Advance" : `Due: ৳${Number(ren.total_due).toLocaleString()}`}
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