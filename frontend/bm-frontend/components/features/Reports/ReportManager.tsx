import { useEffect, useState } from "react";
import { ReportService } from "../../../logic/services/reportService";
import { Spinner, ProgressBar, Badge, Row, Col, Card } from "react-bootstrap";

export default function ReportManager() {
  const [activeTab, setActiveTab] =
    useState<'financial' | 'occupancy' | 'renters'>('financial');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const [
        finSum, finInv,
        occSum, occVac,
        renCol, renDue
      ] = await Promise.all([
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

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" />
        <div className="mt-3 text-muted small">Analyzing your data…</div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 p-2 p-md-4">

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-0">Analytics Dashboard</h4>
          <div className="x-small text-muted">
            Live since {data.financial?.summary?.start_date}
          </div>
        </div>

        <div className="btn-group w-100 w-md-auto bg-white rounded-pill p-1 shadow-sm">
          {['financial', 'occupancy', 'renters'].map(tab => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill fw-bold flex-fill ${
                activeTab === tab ? 'btn-dark text-white' : 'text-muted'
              }`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ================= FINANCIAL ================= */}
      {activeTab === 'financial' && (
        <>
          {/* KPI */}
          <Row className="g-3 mb-3">
            <Col xs={12} md={4}>
              <Card className="p-3 border-0 shadow-sm rounded-4">
                <div className="x-small text-muted">TOTAL INVOICED</div>
                <div className="h4 fw-bold">
                  ৳{Number(data.financial.summary.total_invoiced).toLocaleString()}
                </div>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="p-3 border-0 shadow-sm rounded-4">
                <div className="x-small text-muted">TOTAL COLLECTED</div>
                <div className="h4 fw-bold text-success">
                  ৳{Number(data.financial.summary.total_collected).toLocaleString()}
                </div>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="p-3 border-0 shadow-sm rounded-4">
                <div className="x-small text-muted">OUTSTANDING</div>
                <div className="h4 fw-bold text-danger">
                  ৳{Number(data.financial.summary.total_outstanding).toLocaleString()}
                </div>
              </Card>
            </Col>
          </Row>

          {/* MOBILE CARDS */}
          <div className="d-md-none">
            {data.financial.invoices.map((inv: any) => (
              <Card key={inv.id} className="mb-2 p-3 border-0 shadow-sm rounded-4">
                <div className="fw-bold text-primary">{inv.invoice_number}</div>
                <div className="x-small text-muted">{inv.renter} • {inv.unit}</div>
                <div className="d-flex justify-content-between mt-2">
                  <span className="fw-bold">৳{Number(inv.amount).toLocaleString()}</span>
                  <Badge bg={inv.status === 'paid' ? 'success' : 'danger'}>
                    {inv.status.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="d-none d-md-block">
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <table className="table align-middle mb-0">
                <thead className="bg-light small text-muted">
                  <tr>
                    <th>Invoice</th>
                    <th>Renter</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.financial.invoices.map((inv: any) => (
                    <tr key={inv.id}>
                      <td className="fw-bold text-primary">{inv.invoice_number}</td>
                      <td>{inv.renter}<br /><small className="text-muted">{inv.unit}</small></td>
                      <td className="fw-bold">৳{Number(inv.amount).toLocaleString()}</td>
                      <td>
                        <Badge bg={inv.status === 'paid' ? 'success' : 'danger'}>
                          {inv.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}

      {/* ================= OCCUPANCY ================= */}
      {activeTab === 'occupancy' && (
        <Row className="g-3">
          <Col xs={12} lg={4}>
            <Card className="p-4 border-0 shadow-sm rounded-4 text-center">
              <div className="x-small text-muted mb-2">OCCUPANCY</div>
              <h1 className="fw-bold text-primary">
                {data.occupancy.summary.occupancy_rate}%
              </h1>
              <ProgressBar now={data.occupancy.summary.occupancy_rate} />
            </Card>
          </Col>

          <Col xs={12} lg={8}>
            {/* MOBILE */}
            <div className="d-md-none">
              {data.occupancy.vacant.map((u: any) => (
                <Card key={u.id} className="mb-2 p-3 border-0 shadow-sm rounded-4">
                  <div className="fw-bold">{u.name}</div>
                  <div className="x-small text-muted">
                    Floor {u.floor_name} • {u.unit_type}
                  </div>
                  <div className="fw-bold text-success mt-2">
                    ৳{Number(u.monthly_rent).toLocaleString()}
                  </div>
                </Card>
              ))}
            </div>

            {/* DESKTOP */}
            <div className="d-none d-md-block">
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <table className="table align-middle mb-0">
                  <thead className="bg-light small text-muted">
                    <tr>
                      <th>Unit</th>
                      <th>Floor</th>
                      <th>Type</th>
                      <th>Rent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.occupancy.vacant.map((u: any) => (
                      <tr key={u.id}>
                        <td className="fw-bold">{u.name}</td>
                        <td>{u.floor_name}</td>
                        <td>{u.unit_type}</td>
                        <td className="fw-bold text-success">
                          ৳{Number(u.monthly_rent).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </Col>
        </Row>
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