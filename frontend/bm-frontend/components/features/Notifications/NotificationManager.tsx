import { useNotifications } from "../../../logic/hooks/useNotifications";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, Form, Container } from "react-bootstrap";

export default function NotificationManager() {
  const { error: notifyError } = useNotify();
  const { data, loading, filters, setFilters, refresh } = useNotifications({
    search: "", status: "", channel: "", notification_type: "", page: 1, ordering: "-sent_at"
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-success-subtle text-success border-success';
      case 'failed': return 'bg-danger-subtle text-danger border-danger';
      default: return 'bg-warning-subtle text-warning border-warning';
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5 position-relative animate__animated animate__fadeIn">

      {/* 1. STICKY HEADER (Flush Design) */}
      <div
        className="sticky-top bg-white border-bottom shadow-sm px-3 py-3 mb-3"
        style={{ zIndex: 1020, top: '-24px', marginTop: '-24px' }}
      >
        <Container className="px-0" style={{ maxWidth: '800px' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
               <h5 className="fw-bold m-0 text-dark ls-wide text-uppercase small">System Logs</h5>
               <small className="text-muted d-none d-md-block x-small fw-bold">Real-time delivery status</small>
            </div>
            <button className="btn btn-light border-0 text-primary p-2 rounded-circle shadow-none" onClick={refresh}>
              <i className={`bi bi-arrow-clockwise fs-5 d-block ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
            </button>
          </div>

          <div className="d-flex gap-2 overflow-auto no-scrollbar pb-1">
            <input
              className="form-control rounded-pill bg-light border-0 px-3 small"
              placeholder="Search renter..."
              style={{ minWidth: '160px' }}
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            />
            <Form.Select
              className="rounded-pill bg-light border-0 fw-bold text-muted w-auto x-small"
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

      {/* 2. MAIN LOG CONTENT (Feed Layout) */}
      <Container className="px-2 px-md-0" style={{ maxWidth: '800px' }}>
        <div className="vstack gap-3">
          {loading && data.results.length === 0 ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></div>
          ) : (
            data.results.map((log: any) => (
              <div key={log.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white border-start border-4 border-white">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '42px', height: '42px' }}>
                         <i className={`bi bi-${log.channel === 'whatsapp' ? 'whatsapp text-success' : 'envelope-at text-primary'} fs-5`}></i>
                      </div>
                      <div>
                        <div className="fw-bold text-dark small">{log.renter_name || "System Alert"}</div>
                        <div className="text-muted x-small font-monospace">{log.recipient}</div>
                      </div>
                    </div>
                    <Badge pill className={`px-3 py-2 x-small text-uppercase border fw-bold ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </Badge>
                  </div>

                  <div className="bg-light p-3 rounded-4 mb-3 border-0 shadow-none">
                    <div className="fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.8px' }}>
                      {log.notification_type?.replace(/_/g, ' ')}
                    </div>
                    <div className="fw-bold text-dark small">{log.subject || "No Subject"}</div>
                  </div>

                  {log.status === 'failed' && (
                    <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-4 x-small fw-bold mb-3 border border-danger-subtle">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Error: {log.error_message || "Unknown Provider Error"}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light-subtle">
                    <div className="text-muted x-small fw-bold">
                      <i className="bi bi-clock me-1"></i>
                      {new Date(log.sent_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </div>
                    {log.invoice_id && (
                      <Badge bg="white" className="text-primary border border-primary-subtle rounded-pill fw-bold x-small px-3">
                         INV-#{log.invoice_id}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Container>

      {/* 3. PAGINATION (Fixed at Bottom) */}
      <div className="fixed-bottom bg-white border-top p-3 shadow-lg rounded-top-4" style={{ zIndex: 1010 }}>
        <Container className="px-0 d-flex justify-content-between align-items-center" style={{ maxWidth: '800px' }}>
          <span className="text-muted x-small fw-bold text-uppercase ls-1">Logs: {data.count}</span>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-light border rounded-pill px-4 fw-bold x-small" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>BACK</button>
            <button className="btn btn-sm btn-light border rounded-pill px-4 fw-bold x-small" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>NEXT</button>
          </div>
        </Container>
      </div>
    </div>
  );
}