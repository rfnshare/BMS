import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge } from "react-bootstrap";

export default function RenterInvoiceManager() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices/");
      setInvoices(res.data.results || res.data);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  const filteredData = useMemo(() => {
    if (filter === "all") return invoices;
    return invoices.filter(inv => inv.status === filter);
  }, [invoices, filter]);

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. FILTER CONTROLS - Stacked on Mobile */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 bg-white p-2 rounded-4 shadow-sm border mx-1 gap-2">
        <div className="btn-group p-1 bg-light rounded-pill w-100 w-md-auto">
          {['all', 'paid', 'unpaid'].map((s) => (
            <button
              key={s}
              className={`btn btn-sm rounded-pill px-3 px-md-4 fw-bold text-uppercase flex-grow-1 ${filter === s ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="text-muted x-small fw-bold text-uppercase px-2">
          Results: <span className="text-primary">{filteredData.length}</span>
        </div>
      </div>

      {/* 2. MAIN LISTING SECTION */}
      <div className="bg-transparent">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border mx-1">
             <i className="bi bi-receipt fs-1 text-muted opacity-25 d-block mb-2"></i>
             <span className="text-muted small italic">No matching invoices found.</span>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: List Cards */}
            <div className="d-md-none vstack gap-2 px-1">
              {filteredData.map((inv) => (
                <div key={inv.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <div className="min-vw-0">
                      <div className="fw-bold text-dark small text-truncate">{inv.invoice_number}</div>
                      <div className="text-muted x-small fw-bold text-uppercase" style={{fontSize: '0.6rem'}}>
                        {inv.invoice_month || 'N/A'} • {inv.invoice_type.replace('_', ' ')}
                      </div>
                    </div>
                    <Badge bg={inv.status === 'paid' ? 'success' : 'warning'} className="rounded-pill x-small text-uppercase border-0 flex-shrink-0">
                      {inv.status}
                    </Badge>
                  </div>

                  <div className="d-flex justify-content-between align-items-end pt-2 border-top mt-1">
                    <div>
                      <div className="text-muted x-small">Amount Due</div>
                      <div className="fw-bold text-dark">৳{Number(inv.amount).toLocaleString()}</div>
                    </div>
                    {inv.invoice_pdf ? (
                      <a href={inv.invoice_pdf} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold x-small">
                        <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                      </a>
                    ) : (
                      <span className="text-muted x-small italic opacity-50">Pending PDF</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Legacy Table */}
            <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white mx-1">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light small text-muted text-uppercase">
                    <tr>
                      <th className="ps-4 py-3">Invoice #</th>
                      <th>Category</th>
                      <th>Billing Month</th>
                      <th>Amount</th>
                      <th className="text-center">Status</th>
                      <th className="pe-4 text-end">Documents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((inv) => (
                      <tr key={inv.id}>
                        <td className="ps-4">
                          <div className="fw-bold text-dark small">{inv.invoice_number}</div>
                          <div className="text-muted x-small">Due: {inv.due_date}</div>
                        </td>
                        <td className="small text-capitalize">{inv.invoice_type.replace('_', ' ')}</td>
                        <td className="small">{inv.invoice_month || 'N/A'}</td>
                        <td className="fw-bold text-dark">৳{Number(inv.amount).toLocaleString()}</td>
                        <td className="text-center">
                          <span className={`badge rounded-pill border px-3 py-2 ${inv.status === 'paid' ? 'bg-success-subtle text-success border-success' : 'bg-warning-subtle text-warning border-warning'}`}>
                            {inv.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          {inv.invoice_pdf ? (
                            <a href={inv.invoice_pdf} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold">
                               <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                            </a>
                          ) : (
                            <span className="text-muted x-small italic">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}