import { useNotifications } from "../../../logic/hooks/useNotifications";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import { useMemo } from "react";

export default function NotificationManager() {
  const { error: notifyError } = useNotify();
  const { data, loading, filters, setFilters, refresh } = useNotifications({
    search: "", status: "", channel: "", notification_type: "", page: 1, ordering: "-sent_at"
  });

  // 1. DELIVERY KPI STATS (Blueprint Logic)
  const stats = useMemo(() => {
    const results = data.results || [];
    return {
      total: data.count || 0,
      sent: results.filter((n: any) => n.status === 'sent').length,
      failed: results.filter((n: any) => n.status === 'failed').length,
      whatsapp: results.filter((n: any) => n.channel === 'whatsapp').length,
    };
  }, [data]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-success-subtle text-success border-success';
      case 'failed': return 'bg-danger-subtle text-danger border-danger';
      default: return 'bg-warning-subtle text-warning border-warning';
    }
  };

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 2. INDUSTRIAL HEADER (Right-Aligned Actions) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">

            {/* Identity Block */}
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
                <i className="bi bi-activity fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Communication Logs</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">System Dispatch & Delivery Audit</p>
              </div>
            </div>

            {/* Action Stack */}
            <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
              <Button
                variant="light"
                className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0"
                onClick={refresh}
                disabled={loading}
              >
                <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm border-0' : ''}`}></i>
                <span>REFRESH LOGS</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DELIVERY KPI OVERVIEW */}
      <Row className="g-2 g-md-3 mb-4">
        {[
          { label: "Total Dispatched", val: stats.total, color: "primary", icon: "bi-send" },
          { label: "Delivered", val: stats.sent, color: "success", icon: "bi-check-all" },
          { label: "Failure Rate", val: stats.failed, color: "danger", icon: "bi-exclamation-octagon" },
          { label: "WhatsApp Vol.", val: stats.whatsapp, color: "info", icon: "bi-whatsapp" },
        ].map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
              </div>
              <div className={`h4 fw-bold mb-0 text-${s.color} fs-5 fs-md-4`}>
                {typeof s.val === 'number' ? s.val.toString().padStart(2, '0') : s.val}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 4. FILTER PILL BAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white border">
        <Row className="g-2">
          <Col xs={12} md={6}>
            <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
              <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
              <Form.Control
                className="bg-light border-0 py-2 shadow-none fw-medium"
                placeholder="Search recipient or subject..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
              />
            </InputGroup>
          </Col>
          <Col xs={6} md={3}>
            <Form.Select
              size="sm" className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none"
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
            >
              <option value="">All Statuses</option>
              <option value="sent">Sent Successfully</option>
              <option value="failed">Failed Delivery</option>
              <option value="pending">Queued</option>
            </Form.Select>
          </Col>
          <Col xs={6} md={3}>
            <Form.Select
              size="sm" className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none"
              value={filters.channel}
              onChange={e => setFilters({...filters, channel: e.target.value, page: 1})}
            >
              <option value="">All Channels</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email Service</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* 5. DATA VIEW: INDUSTRIAL TABLE (Desktop) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white d-none d-md-block mb-4">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light border-bottom">
            <tr className="text-muted x-small fw-bold text-uppercase ls-1">
              <th className="ps-4 py-3">Timestamp</th>
              <th>Recipient</th>
              <th>Type & Channel</th>
              <th className="text-center">Status</th>
              <th className="pe-4 text-end">Audit</th>
            </tr>
          </thead>
          <tbody>
            {loading && data.results.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
            ) : data.results.map((log: any) => (
              <tr key={log.id}>
                <td className="ps-4">
                  <div className="fw-bold text-dark small">
                    {new Date(log.sent_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className="text-muted x-small fw-bold font-monospace">
                    {new Date(log.sent_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td>
                  <div className="fw-bold small text-primary">{log.renter_name || "System Dispatch"}</div>
                  <div className="text-muted x-small font-monospace opacity-75">{log.recipient}</div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi bi-${log.channel === 'whatsapp' ? 'whatsapp text-success' : 'envelope-at text-primary'}`}></i>
                    <span className="x-small fw-bold text-uppercase ls-1 text-muted">{log.notification_type?.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td className="text-center">
                  <Badge pill className={`border px-3 py-2 fw-bold text-uppercase ls-1 x-small ${getStatusBadge(log.status)}`}>
                    {log.status}
                  </Badge>
                </td>
                <td className="pe-4 text-end">
                    {log.invoice_id && (
                      <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill fw-bold x-small px-3 ls-1">
                         INV-#{log.invoice_id}
                      </Badge>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. MOBILE LOG FEED (Blueprint Style) */}
      <div className="d-block d-md-none vstack gap-2 p-2 mb-5">
        {data.results.map((log: any) => (
          <div key={log.id} className={`card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 ${log.status === 'failed' ? 'border-danger' : 'border-success'} animate__animated animate__fadeIn`}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-light rounded-circle p-2 border">
                   <i className={`bi bi-${log.channel === 'whatsapp' ? 'whatsapp text-success' : 'envelope-at text-primary'} fs-6`}></i>
                </div>
                <div>
                   <div className="fw-bold text-dark small">{log.renter_name || "System"}</div>
                   <div className="text-muted x-small font-monospace">{log.recipient}</div>
                </div>
              </div>
              <Badge pill className={`x-small fw-bold border ${getStatusBadge(log.status)}`}>{log.status.toUpperCase()}</Badge>
            </div>

            <div className="bg-light p-2 rounded-3 my-2 border-0">
               <div className="fw-bold text-primary x-small text-uppercase ls-1">{log.notification_type?.replace(/_/g, ' ')}</div>
               <div className="small text-dark fw-medium mt-1">{log.subject}</div>
            </div>

            {log.status === 'failed' && (
              <div className="text-danger x-small fw-bold mt-1">
                <i className="bi bi-info-circle me-1"></i>{log.error_message || "Service Provider Timeout"}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-light">
               <div className="text-muted x-small fw-bold ls-1"><i className="bi bi-clock me-1"></i>{new Date(log.sent_at).toLocaleString()}</div>
               {log.invoice_id && <span className="text-primary fw-bold x-small ls-1">#INV-{log.invoice_id}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 7. ADAPTIVE PAGINATION */}
      <div className="p-3 bg-white rounded-4 shadow-sm border d-flex justify-content-between align-items-center mt-3 mb-5">
        <span className="text-muted x-small fw-bold ls-1 text-uppercase">Syncing {data.count} Audit Logs</span>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" className="rounded-pill px-4 fw-bold ls-1" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>PREV</Button>
          <Button variant="outline-secondary" size="sm" className="rounded-pill px-4 fw-bold ls-1" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>NEXT</Button>
        </div>
      </div>
    </div>
  );
}