import { useEffect, useState } from "react";
import { ReportService } from "../../../logic/services/reportService";
import { Spinner, ProgressBar, Badge, Card, Row, Col } from "react-bootstrap";

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAllReports(); }, []);

  if (loading) return <div className="text-center py-5 min-vh-100"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted x-small">Analyzing Portfolio...</p></div>;

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* MOBILE-CENTRIC TABS */}
      <div className="bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 1020 }}>
        <div className="p-3 text-center border-bottom">
          <h5 className="fw-bold mb-0 text-dark">Portfolio Analytics</h5>
        </div>
        <div className="d-flex nav nav-pills p-2 gap-2 overflow-auto no-scrollbar">
          {['financial', 'occupancy', 'renters'].map((tab: any) => (
            <button
              key={tab}
              className={`nav-link rounded-pill flex-grow-1 fw-bold small border-0 px-4 ${activeTab === tab ? 'bg-dark text-white' : 'text-muted bg-light'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 mt-2">
        {/* FINANCIAL VIEW */}
        {activeTab === 'financial' && (
          <div className="animate__animated animate__fadeIn">
            <Row className="g-2 mb-3">
              <Col xs={12}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="text-muted x-small fw-bold text-uppercase mb-1">Total Invoiced</div>
                  <div className="h2 fw-bold text-dark">৳{Number(data.financial.summary.total_invoiced).toLocaleString()}</div>
                  <div className="x-small text-primary fw-bold"><i className="bi bi-receipt"></i> {data.financial.summary.invoice_count} Records</div>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success h-100">
                  <div className="text-muted x-small fw-bold text-uppercase mb-1">Collected</div>
                  <div className="h4 fw-bold text-success">৳{Number(data.financial.summary.total_collected).toLocaleString()}</div>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger h-100">
                  <div className="text-muted x-small fw-bold text-uppercase mb-1">Due</div>
                  <div className="h4 fw-bold text-danger">৳{Number(data.financial.summary.total_outstanding).toLocaleString()}</div>
                </Card>
              </Col>
            </Row>

            <h6 className="fw-bold px-2 mb-3 small text-muted text-uppercase">Latest Activity</h6>
            <div className="vstack gap-2">
              {data.financial.invoices.map((inv: any) => (
                <div key={inv.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold small">{inv.renter}</div>
                      <div className="text-muted x-small">{inv.invoice_number} • {inv.unit}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-dark">৳{Number(inv.amount).toLocaleString()}</div>
                      <Badge bg={inv.status === 'paid' ? 'success' : 'danger'} className="x-small rounded-pill">{inv.status.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OCCUPANCY VIEW (Circle Chart feel) */}
        {activeTab === 'occupancy' && (
          <div className="animate__animated animate__fadeIn">
            <Card className="border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-3">
              <div className="display-4 fw-bold text-primary mb-0">{data.occupancy.summary.occupancy_rate}%</div>
              <div className="text-muted small fw-bold mb-4">CAPACITY FILLED</div>
              <ProgressBar now={data.occupancy.summary.occupancy_rate} variant="primary" className="rounded-pill mb-4" style={{ height: '12px' }} />
              <div className="row g-0 border-top pt-3">
                <div className="col-4 border-end"><div className="fw-bold">{data.occupancy.summary.total_units}</div><div className="x-small text-muted">UNITS</div></div>
                <div className="col-4 border-end"><div className="fw-bold text-success">{data.occupancy.summary.occupied_units}</div><div className="x-small text-muted">LIVE</div></div>
                <div className="col-4"><div className="fw-bold text-danger">{data.occupancy.summary.vacant_units}</div><div className="x-small text-muted">EMPTY</div></div>
              </div>
            </Card>

            <h6 className="fw-bold px-2 mb-3 small text-muted text-uppercase">Available Inventory</h6>
            <div className="vstack gap-2">
               {data.occupancy.vacant.map((u: any) => (
                 <div key={u.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-bold">{u.name} <span className="text-muted fw-normal x-small">({u.floor_name})</span></div>
                      <div className="text-success fw-bold">৳{Number(u.monthly_rent).toLocaleString()}</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}