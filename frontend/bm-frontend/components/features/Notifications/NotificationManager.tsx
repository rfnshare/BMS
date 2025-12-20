import { useEffect, useState } from "react";
import { NotificationService } from "../../../logic/services/notificationService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge, Form, Container, Row, Col } from "react-bootstrap";

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
      case 'sent': return 'bg-success text-white';
      case 'failed': return 'bg-danger text-white';
      default: return 'bg-warning text-dark border';
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">

      {/* 1. STICKY HEADER
          FIX: mx-n1 (mobile) to mx-md-0 (desktop) prevents navbar breaking.
      */}
      <div
        className="sticky-top bg-white border-bottom shadow-sm mx-n1 mx-md-0 px-3 py-3 mb-3"
        style={{ zIndex: 1020, top: '70px' }}
      >
        <Container className="px-0" style={{ maxWidth: '900px' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
               <h5 className="fw-bold m-0 text-dark">System Logs</h5>
               <small className="text-muted d-none d-md-block">Audit trail for emails & WhatsApp</small>
            </div>
            <button className="btn btn-light border rounded-pill px-3 fw-bold btn-sm shadow-sm" onClick={loadNotifications}>
              <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
            </button>
          </div>

          <div className="d-flex gap-2 overflow-auto no-scrollbar pb-1">
            <input
              className="form-control rounded-pill bg-light border-0 px-3"
              placeholder="Filter renter..."
              style={{ minWidth: '160px', fontSize: '1rem' }}
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            />
            <Form.Select
              className="rounded-pill bg-light border-0 fw-bold text-muted w-auto"
              style={{ fontSize: '0.9rem' }}
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
            >
              <option value="">Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </Form.Select>
          </div>
        </Container>
      </div>

      {/* 2. MAIN LOG CONTENT */}
      <Container style={{ maxWidth: '900px' }}>
        <div className="vstack gap-2">
          {loading && data.results.length === 0 ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : data.results.length === 0 ? (
            <div className="text-center py-5 text-muted border rounded-4 bg-white">No notifications found.</div>
          ) : (
            data.results.map((log: any) => (
              <div key={log.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                         <i className={`bi bi-${log.channel === 'whatsapp' ? 'whatsapp text-success' : 'envelope-at text-primary'} fs-5`}></i>
                      </div>
                      <div>
                        <div className="fw-bold text-dark small lh-1">{log.renter_name || "System"}</div>
                        <div className="text-muted x-small font-monospace mt-1">{log.recipient}</div>
                      </div>
                    </div>
                    <Badge className={`rounded-pill px-2 py-1 x-small text-uppercase border-0 ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </Badge>
                  </div>

                  <div className="bg-light p-3 rounded-3 mb-3 border border-light-subtle">
                    <div className="fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                      {log.notification_type?.replace(/_/g, ' ')}
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{log.subject || "No Subject"}</div>
                  </div>

                  {log.status === 'failed' && (
                    <div className="p-2 px-3 bg-danger bg-opacity-10 text-danger rounded-3 x-small fw-bold mb-3 border border-danger border-opacity-10">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {log.error_message || "Carrier Response Timeout"}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center pt-2">
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                      <i className="bi bi-clock me-1"></i>
                      {new Date(log.sent_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    {log.invoice_id && (
                      <span className="fw-bold text-primary small cursor-pointer">
                         INV-{log.invoice_id} <i className="bi bi-chevron-right"></i>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Container>

      {/* 3. PAGINATION FOOTER
          FIX: mx-md-0 avoids desktop layout shift.
      */}
      <div
        className="sticky-bottom bg-white border-top p-3 shadow-lg mx-n1 mx-md-0 mt-4"
        style={{ zIndex: 1010 }}
      >
        <Container className="px-0 d-flex justify-content-between align-items-center" style={{ maxWidth: '900px' }}>
          <span className="text-muted small">Logs: <b>{data.count}</b></span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-light border rounded-pill px-4 fw-bold"
              disabled={!data.previous}
              onClick={() => { setFilters({...filters, page: filters.page - 1}); window.scrollTo(0,0); }}
            >
              Back
            </button>
            <button
              className="btn btn-sm btn-light border rounded-pill px-4 fw-bold"
              disabled={!data.next}
              onClick={() => { setFilters({...filters, page: filters.page + 1}); window.scrollTo(0,0); }}
            >
              Next
            </button>
          </div>
        </Container>
      </div>
    </div>
  );
}