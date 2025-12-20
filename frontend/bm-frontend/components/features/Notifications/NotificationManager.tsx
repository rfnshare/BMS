import { useEffect, useState } from "react";
import { NotificationService } from "../../../logic/services/notificationService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge, Form } from "react-bootstrap";

export default function NotificationManager() {
  const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "", status: "", channel: "", notification_type: "", page: 1, ordering: "-sent_at"
  });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await NotificationService.list(filters);
      setData(res);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, [filters.status, filters.channel, filters.notification_type, filters.page, filters.search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-success text-white shadow-sm';
      case 'failed': return 'bg-danger text-white shadow-sm';
      default: return 'bg-warning text-dark border';
    }
  };

  return (
    <div className="bg-light min-vh-100 px-1 px-md-3">
      {/* 1. COMPACT STICKY HEADER (Solves the zoom-out look) */}
      <div className="sticky-top bg-white border-bottom shadow-sm mx-n1 px-3 py-3 mb-3" style={{ zIndex: 1020 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold m-0 text-dark" style={{ fontSize: '1.25rem' }}>System Logs</h5>
          <button className="btn btn-primary rounded-pill px-3 fw-bold btn-sm shadow-sm" onClick={loadNotifications}>
            <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
          </button>
        </div>

        {/* Full-width scrolling filters */}
        <div className="d-flex gap-2 overflow-auto no-scrollbar pb-1">
          <input
            className="form-control rounded-pill bg-light border-0 px-3"
            placeholder="Search renter..."
            style={{ minWidth: '180px', fontSize: '1rem' }}
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          />
          <Form.Select
            className="rounded-pill bg-light border-0 fw-bold text-muted"
            style={{ minWidth: '120px', fontSize: '0.9rem' }}
            onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
          >
            <option value="">Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </Form.Select>
        </div>
      </div>

      {/* 2. HIGH-DENSITY AUDIT CARDS */}
      <div className="vstack gap-2">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : data.results.length === 0 ? (
          <div className="text-center py-5 text-muted">No logs recorded.</div>
        ) : (
          data.results.map((log: any) => (
            <div key={log.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mx-1">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                       <i className={`bi bi-${log.channel === 'whatsapp' ? 'whatsapp text-success' : 'envelope-at text-primary'} fs-4`}></i>
                    </div>
                    <div>
                      <div className="fw-bold text-dark fs-6 lh-1">{log.renter_name || "System"}</div>
                      <div className="text-muted x-small font-monospace mt-1">{log.recipient}</div>
                    </div>
                  </div>
                  <Badge className={`rounded-pill px-3 py-2 x-small text-uppercase ${getStatusBadge(log.status)}`}>
                    {log.status}
                  </Badge>
                </div>

                <div className="bg-light bg-opacity-75 p-3 rounded-3 border border-light mb-3">
                  <div className="fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                    {log.notification_type?.replace(/_/g, ' ')}
                  </div>
                  <div className="fw-bold text-dark small" style={{ fontSize: '0.95rem' }}>{log.subject || "Security Alert"}</div>
                </div>

                {log.status === 'failed' && (
                  <div className="p-2 px-3 bg-danger bg-opacity-10 text-danger rounded-3 x-small fw-bold mb-3 border border-danger border-opacity-25">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {log.error_message || "Carrier Timeout"}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center border-top pt-2">
                  <div className="text-muted x-small">
                    <i className="bi bi-clock me-1"></i>
                    {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {log.invoice_id && (
                    <span className="fw-bold text-primary small">
                       Invoice INV-{log.invoice_id} <i className="bi bi-chevron-right small"></i>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. FLOATING PAGINATION */}
      <div className="sticky-bottom bg-white border-top p-3 shadow-lg mx-n1 mt-4 d-flex justify-content-between align-items-center">
        <span className="text-muted small">Total: <b>{data.count}</b></span>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-light border rounded-pill px-3" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>Prev</button>
          <button className="btn btn-sm btn-light border rounded-pill px-3" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</button>
        </div>
      </div>
    </div>
  );
}