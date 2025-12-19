import { useEffect, useState } from "react";
import { NotificationService } from "../../../logic/services/notificationService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge, Row, Col, Form, Button, Collapse } from "react-bootstrap";

export default function RenterNotificationManager() {
  const [data, setData] = useState<any>({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null); // Track which message is expanded

  const [filters, setFilters] = useState({
    channel: "",
    notification_type: "",
    page: 1
  });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await NotificationService.list(filters);
      setData(res);
    } catch (err: any) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, [filters.channel, filters.notification_type, filters.page]);

  const getChannelBadge = (channel: string) => (
    <Badge bg="light" text="dark" className="border px-3 rounded-pill fw-normal">
      <i className={`bi bi-${channel === 'whatsapp' ? 'whatsapp text-success' : 'envelope-at text-primary'} me-2`}></i>
      {channel.toUpperCase()}
    </Badge>
  );

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
      <div className="p-4 border-bottom bg-white">
        <h5 className="fw-bold mb-3">Communication Log</h5>
        <Row className="g-2">
          <Col xs={6} md={3}>
            <Form.Select
              size="sm"
              className="rounded-pill bg-light border-0 ps-3"
              value={filters.channel}
              onChange={e => setFilters({...filters, channel: e.target.value, page: 1})}
            >
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </Form.Select>
          </Col>
          <Col xs={6} md={4}>
            <Form.Select
              size="sm"
              className="rounded-pill bg-light border-0 ps-3"
              value={filters.notification_type}
              onChange={e => setFilters({...filters, notification_type: e.target.value, page: 1})}
            >
              <option value="">All Message Types</option>
              <option value="invoice_created">Invoice Generated</option>
              <option value="rent_reminder">Rent Reminder</option>
              <option value="overdue_notice">Overdue Notice</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      <div className="list-group list-group-flush">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : data.results.length === 0 ? (
          <div className="text-center py-5 text-muted">No communication records found.</div>
        ) : (
          data.results.map((notif: any) => (
            <div key={notif.id} className="list-group-item p-0 border-bottom border-light">
              <div
                className="p-4 cursor-pointer hover-bg-light"
                onClick={() => setOpenId(openId === notif.id ? null : notif.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="fw-bold mb-1 text-dark">{notif.subject}</h6>
                    {getChannelBadge(notif.channel)}
                  </div>
                  <div className="text-end">
                    <div className="text-muted x-small">{new Date(notif.sent_at).toLocaleString()}</div>
                    <i className={`bi bi-chevron-${openId === notif.id ? 'up' : 'down'} small text-muted`}></i>
                  </div>
                </div>
              </div>

              {/* 🔥 FIX: Render HTML inside Collapse */}
              <Collapse in={openId === notif.id}>
                <div>
                  <div className="px-4 pb-4">
                    <div
                      className="p-3 rounded-4 border bg-white shadow-inner overflow-auto"
                      style={{ maxHeight: '400px' }}
                      dangerouslySetInnerHTML={{ __html: notif.message }}
                    />
                  </div>
                </div>
              </Collapse>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {data.count > 0 && (
        <div className="p-3 bg-light d-flex justify-content-between align-items-center">
          <span className="text-muted x-small">Total Records: {data.count}</span>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-white border rounded-pill px-3" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>Prev</button>
            <button className="btn btn-sm btn-white border rounded-pill px-3" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}