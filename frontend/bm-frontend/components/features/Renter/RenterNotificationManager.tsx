import { useEffect, useState, useMemo } from "react";
import { NotificationService } from "../../../logic/services/notificationService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Added Notifications
import { Spinner, Badge, Row, Col, Form, Button, Collapse, InputGroup } from "react-bootstrap";

export default function RenterNotificationManager() {
  const { error: notifyError } = useNotify();
  const [data, setData] = useState<any>({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    channel: "",
    notification_type: "",
    page: 1
  });

  // 1. DISPATCH KPI STATS (Blueprint Logic)
  const stats = useMemo(() => {
    const results = data.results || [];
    return {
      total: data.count || 0,
      whatsapp: results.filter((n: any) => n.channel === 'whatsapp').length,
      email: results.filter((n: any) => n.channel === 'email').length,
      alerts: results.filter((n: any) => n.notification_type === 'overdue_notice').length,
    };
  }, [data]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await NotificationService.list(filters);
      setData(res);
    } catch (err: any) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, [filters.channel, filters.notification_type, filters.page]);

  const getChannelBadge = (channel: string) => (
    <Badge pill className={`px-3 py-2 border ls-1 fw-bold text-uppercase x-small ${channel === 'whatsapp' ? 'bg-success-subtle text-success border-success' : 'bg-primary-subtle text-primary border-primary'}`}>
      <i className={`bi bi-${channel === 'whatsapp' ? 'whatsapp' : 'envelope-at'} me-2`}></i>
      {channel}
    </Badge>
  );

  return (
    <div className="animate__animated animate__fadeIn pb-5">

      {/* 2. INDUSTRIAL HEADER BLOCK */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
                <i className="bi bi-broadcast fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Communication Log</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">
                    Official Dispatch Registry & Message History
                </p>
              </div>
            </div>
            <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
                <Button variant="light" className="rounded-pill px-4 fw-bold small border ls-1 text-muted shadow-sm flex-grow-1" onClick={loadNotifications}>
                    <i className="bi bi-arrow-clockwise me-2"></i>REFRESH REGISTRY
                </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DISPATCH KPI OVERVIEW */}
      <Row className="g-2 g-md-3 mb-4">
        {[
          { label: "Total Dispatched", val: stats.total, color: "primary", icon: "bi-send-check" },
          { label: "WhatsApp Logs", val: stats.whatsapp, color: "success", icon: "bi-whatsapp" },
          { label: "Email Logs", val: stats.email, color: "info", icon: "bi-envelope-paper" },
          { label: "Urgent Notices", val: stats.alerts, color: "danger", icon: "bi-exclamation-triangle" },
        ].map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
              </div>
              <div className={`h4 fw-bold mb-0 text-dark fs-5 fs-md-4 font-monospace`}>
                {s.val.toString().padStart(2, '0')}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 4. FILTER PILL BAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white border">
        <Row className="g-2">
          <Col xs={6} md={6}>
            <Form.Select
              size="sm"
              className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none"
              value={filters.channel}
              onChange={e => setFilters({...filters, channel: e.target.value, page: 1})}
            >
              <option value="">All Channels</option>
              <option value="email">Email Service</option>
              <option value="whatsapp">WhatsApp Business</option>
            </Form.Select>
          </Col>
          <Col xs={6} md={6}>
            <Form.Select
              size="sm"
              className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none"
              value={filters.notification_type}
              onChange={e => setFilters({...filters, notification_type: e.target.value, page: 1})}
            >
              <option value="">All Message Types</option>
              <option value="invoice_created">Invoice Dispatch</option>
              <option value="rent_reminder">Standard Reminder</option>
              <option value="overdue_notice">Overdue Protocol</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* 5. AUDIT FEED (Industrial List) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3">
        <div className="list-group list-group-flush">
          {loading && data.results.length === 0 ? (
            <div className="text-center py-5 vstack gap-2">
                <Spinner animation="grow" variant="primary" size="sm" />
                <div className="x-small fw-bold ls-1 text-muted text-uppercase">Fetching Dispatch Data...</div>
            </div>
          ) : data.results.length === 0 ? (
            <div className="text-center py-5 text-muted x-small fw-bold ls-1 text-uppercase">No communication records synchronized.</div>
          ) : (
            data.results.map((notif: any) => (
              <div key={notif.id} className="list-group-item p-0 border-bottom border-light transition-all">
                <div
                  className={`p-4 cursor-pointer hover-bg-light ${openId === notif.id ? 'bg-light bg-opacity-50' : ''}`}
                  onClick={() => setOpenId(openId === notif.id ? null : notif.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <div className={`p-2 rounded-circle border ${notif.channel === 'whatsapp' ? 'text-success' : 'text-primary'} bg-white shadow-sm`}>
                            <i className={`bi bi-${notif.channel === 'whatsapp' ? 'whatsapp' : 'envelope-at'} fs-5`}></i>
                        </div>
                        <div>
                            <h6 className="fw-bold mb-1 text-dark ls-1">{notif.subject}</h6>
                            <div className="d-flex gap-2">
                                {getChannelBadge(notif.channel)}
                                <Badge bg="light" className="text-muted border fw-bold x-small ls-1 text-uppercase px-2">
                                    {notif.notification_type?.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="text-end d-none d-md-block">
                      <div className="text-muted fw-bold ls-1 font-monospace" style={{ fontSize: '0.7rem' }}>
                        {new Date(notif.sent_at).toLocaleString('en-GB')}
                      </div>
                      <i className={`bi bi-chevron-${openId === notif.id ? 'up-circle-fill' : 'down-circle'} text-primary opacity-50`}></i>
                    </div>
                  </div>
                </div>

                <Collapse in={openId === notif.id}>
                  <div>
                    <div className="px-4 pb-4">
                      <div className="p-3 p-md-4 rounded-4 border bg-white shadow-inner overflow-auto border-start border-4 border-primary">
                        <div className="mb-3 pb-2 border-bottom d-flex justify-content-between align-items-center">
                            <small className="fw-bold text-muted text-uppercase ls-1">Dispatch Content Payload</small>
                            <small className="text-muted font-monospace x-small">Audit ID: #{notif.id}</small>
                        </div>
                        <div
                          className="small text-dark fw-medium"
                          style={{ lineHeight: '1.6' }}
                          dangerouslySetInnerHTML={{ __html: notif.message }}
                        />
                      </div>
                    </div>
                  </div>
                </Collapse>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. ADAPTIVE PAGINATION */}
      {data.count > 0 && (
        <div className="p-3 bg-white rounded-4 shadow-sm border d-flex justify-content-between align-items-center mt-3 mb-5">
          <span className="text-muted x-small fw-bold ls-1 text-uppercase">Registry Volume: {data.count}</span>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" className="rounded-pill px-4 fw-bold ls-1" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>PREV</Button>
            <Button variant="outline-secondary" size="sm" className="rounded-pill px-4 fw-bold ls-1" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>NEXT</Button>
          </div>
        </div>
      )}
    </div>
  );
}