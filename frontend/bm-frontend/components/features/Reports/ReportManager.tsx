import { useEffect, useState } from "react";
import { ReportService } from "../../../logic/services/reportService";
import { Spinner, ProgressBar, Badge } from "react-bootstrap";

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
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">Generating your intelligent reports...</p>
    </div>
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      {/* 1. TOP-LEVEL NAV */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0">Analytics Dashboard</h2>
          <p className="text-muted small">Real-time data from {data.financial?.summary?.start_date} to Today</p>
        </div>
        <div className="btn-group bg-white p-1 rounded-pill shadow-sm">
          {['financial', 'occupancy', 'renters'].map((tab: any) => (
            <button
              key={tab}
              className={`btn rounded-pill px-4 btn-sm fw-bold border-0 ${activeTab === tab ? 'btn-dark text-white' : 'text-muted'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2. FINANCIAL FOCUS */}
      {activeTab === 'financial' && (
        <div className="animate__animated animate__fadeIn">
          {/* Executive KPI Bar */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="small text-muted text-uppercase fw-bold mb-1">Total Cash Invoiced</div>
                <div className="h2 fw-bold text-dark">৳{Number(data.financial.summary.total_invoiced).toLocaleString()}</div>
                <div className="small text-primary fw-bold mt-2"><i className="bi bi-receipt"></i> {data.financial.summary.invoice_count} Invoices</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-success">
                <div className="small text-muted text-uppercase fw-bold mb-1">Total Collected</div>
                <div className="h2 fw-bold text-success">৳{Number(data.financial.summary.total_collected).toLocaleString()}</div>
                <div className="small text-muted mt-2">Efficiency: {((data.financial.summary.total_collected / data.financial.summary.total_invoiced) * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-danger">
                <div className="small text-muted text-uppercase fw-bold mb-1">Outstanding Balance</div>
                <div className="h2 fw-bold text-danger">৳{Number(data.financial.summary.total_outstanding).toLocaleString()}</div>
                <div className="small text-danger fw-bold mt-2"><i className="bi bi-clock-history"></i> High Risk Exposure</div>
              </div>
            </div>
          </div>

          {/* Recent Ledger */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 fw-bold border-bottom">Latest Billing Activity</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light small text-muted text-uppercase">
                  <tr><th>Invoice #</th><th>Renter</th><th>Unit</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.financial.invoices.map((inv: any) => (
                    <tr key={inv.id}>
                      <td className="ps-3 fw-bold small">{inv.invoice_number}</td>
                      <td>{inv.renter}</td>
                      <td className="small text-muted">{inv.unit}</td>
                      <td className="fw-bold">৳{Number(inv.amount).toLocaleString()}</td>
                      <td>
                        <Badge pill bg={inv.status === 'paid' ? 'success' : 'danger'} className="px-3">
                          {inv.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. OCCUPANCY FOCUS */}
      {activeTab === 'occupancy' && (
        <div className="animate__animated animate__fadeIn">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white text-center">
                <div className="small text-muted text-uppercase fw-bold mb-4">Building Occupancy</div>
                <div className="position-relative d-inline-block mb-4">
                   <h1 className="display-3 fw-bold text-primary mb-0">{data.occupancy.summary.occupancy_rate}%</h1>
                   <div className="text-muted small">Capacity Filled</div>
                </div>
                <ProgressBar now={data.occupancy.summary.occupancy_rate} variant="primary" className="mb-4" style={{height: '8px'}} />
                <div className="row text-center border-top pt-3">
                   <div className="col-4 border-end">
                      <div className="fw-bold">{data.occupancy.summary.total_units}</div>
                      <div className="x-small text-muted">TOTAL</div>
                   </div>
                   <div className="col-4 border-end">
                      <div className="fw-bold text-success">{data.occupancy.summary.occupied_units}</div>
                      <div className="x-small text-muted">LIVE</div>
                   </div>
                   <div className="col-4">
                      <div className="fw-bold text-danger">{data.occupancy.summary.vacant_units}</div>
                      <div className="x-small text-muted">EMPTY</div>
                   </div>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
                <div className="card-header bg-white p-3 fw-bold border-bottom text-primary">Revenue Opportunities (Vacant Units)</div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light small text-muted">
                      <tr><th>Unit Name</th><th>Floor</th><th>Type</th><th>Market Rent</th></tr>
                    </thead>
                    <tbody>
                      {data.occupancy.vacant.map((u: any) => (
                        <tr key={u.id}>
                          <td className="ps-3 fw-bold">{u.name}</td>
                          <td>{u.floor_name}</td>
                          <td><span className="badge bg-light text-dark border">{u.unit_type.toUpperCase()}</span></td>
                          <td className="fw-bold text-success">৳{Number(u.monthly_rent).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RENTER FOCUS */}
      {activeTab === 'renters' && (
        <div className="animate__animated animate__fadeIn">
          <div className="row g-4">
            {/* Top Debtors */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-danger text-white p-3 fw-bold border-0">Critical Dues (Top Debtors)</div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light x-small text-muted text-uppercase">
                      <tr><th>Renter</th><th>Phone</th><th className="text-end">Balance</th></tr>
                    </thead>
                    <tbody>
                      {data.renters.dues.map((ren: any) => (
                        <tr key={ren.renter_id}>
                          <td className="ps-3 fw-bold small">{ren.full_name}</td>
                          <td className="small text-muted">{ren.phone_number}</td>
                          <td className="text-end fw-bold text-danger">৳{Number(ren.total_due).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Collection Performance */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-success text-white p-3 fw-bold border-0">Collection Ledger (Overview)</div>
                <div className="table-responsive" style={{maxHeight: '400px'}}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light x-small text-muted text-uppercase">
                      <tr><th>Name</th><th className="text-end">Paid</th><th className="text-end">Due</th></tr>
                    </thead>
                    <tbody>
                      {data.renters.collection.map((ren: any) => (
                        <tr key={ren.renter_id}>
                          <td className="ps-3 small">
                            <div className="fw-bold">{ren.full_name}</div>
                            <div className="x-small text-muted">{ren.phone_number}</div>
                          </td>
                          <td className="text-end text-success fw-bold">৳{Number(ren.total_paid).toLocaleString()}</td>
                          <td className="text-end text-danger fw-bold">
                            {Number(ren.total_due) < 0 ? <span className="text-primary">(Advance)</span> : `৳${Number(ren.total_due).toLocaleString()}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}