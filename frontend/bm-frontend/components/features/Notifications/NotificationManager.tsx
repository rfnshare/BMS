import { useEffect, useState } from "react";
import { NotificationService } from "../../../logic/services/notificationService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Tooltip, OverlayTrigger } from "react-bootstrap";

export default function NotificationManager() {
  const [data, setData] = useState<any>({ results: [], count: 0, next: null });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    channel: "",
    notification_type: "",
    page: 1,
    ordering: "-sent_at"
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

  // UI Helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'sent': return 'bg-success-subtle text-success border-success';
        case 'failed': return 'bg-danger-subtle text-danger border-danger';
        default: return 'bg-warning-subtle text-warning border-warning';
    }
  };

  const getChannelIcon = (channel: string) => {
    return channel === 'whatsapp'
        ? <i className="bi bi-whatsapp text-success fs-5"></i>
        : <i className="bi bi-envelope-at text-primary fs-5"></i>;
  };

  const formatType = (type: string) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="bg-white">
      {/* HEADER */}
      <div className="p-4 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h5 className="fw-bold text-dark m-0">Notification Log</h5>
                <p className="text-muted small m-0">Audit system messages sent to renters.</p>
            </div>
            <button className="btn btn-light btn-sm rounded-pill px-3 border shadow-sm" onClick={loadNotifications}>
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
        </div>

        {/* 🚀 RESPONSIVE FILTERS FIX */}
        <div className="row g-2">
            {/* Search: Full width on mobile, auto on desktop */}
            <div className="col-12 col-md-auto">
                <input
                    type="text"
                    className="form-control form-control-sm bg-light border-0 px-3 rounded-pill w-100"
                    placeholder="Search recipient..."
                    style={{ minWidth: '200px' }} // Ensures it's not too small on desktop
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                />
            </div>

            {/* Dropdowns: 2 per row on mobile (col-6), auto on desktop */}
            <div className="col-6 col-md-auto">
                <select
                    className="form-select form-select-sm bg-light border-0 ps-3 pe-5 rounded-pill w-100"
                    value={filters.status}
                    onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
                >
                    <option value="">All Statuses</option>
                    {NotificationService.getStatuses().map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            <div className="col-6 col-md-auto">
                <select
                    className="form-select form-select-sm bg-light border-0 ps-3 pe-5 rounded-pill w-100"
                    value={filters.channel}
                    onChange={e => setFilters({...filters, channel: e.target.value, page: 1})}
                >
                    <option value="">All Channels</option>
                    {NotificationService.getChannels().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            <div className="col-12 col-md-auto">
                <select
                    className="form-select form-select-sm bg-light border-0 ps-3 pe-5 rounded-pill w-100"
                    value={filters.notification_type}
                    onChange={e => setFilters({...filters, notification_type: e.target.value, page: 1})}
                >
                    <option value="">All Notification Types</option>
                    {NotificationService.getTypes().map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr className="text-muted x-small fw-bold text-uppercase">
                <th className="ps-4">Channel</th>
                <th>Sent To</th>
                <th>Type / Subject</th>
                <th>Status</th>
                <th>Time</th>
                <th className="pe-4 text-end">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={6} className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
            ) : data.results.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-muted">No logs found.</td></tr>
            ) : (
                data.results.map((log: any) => (
                    <tr key={log.id}>
                        <td className="ps-4 text-center" style={{width: '80px'}}>
                            <div className="bg-light rounded-circle p-2 d-inline-block border">
                                {getChannelIcon(log.channel)}
                            </div>
                        </td>
                        <td>
                            <div className="fw-bold text-dark small">{log.renter_name || "Unknown Renter"}</div>
                            <div className="text-muted x-small font-monospace">{log.recipient}</div>
                        </td>
                        <td>
                            <div className="badge bg-light text-dark border fw-normal mb-1">{formatType(log.notification_type)}</div>
                            <div className="small text-muted text-truncate" style={{maxWidth: '200px'}}>{log.subject || "No Subject"}</div>
                        </td>
                        <td>
                            <span className={`badge rounded-pill border px-3 ${getStatusBadge(log.status)}`}>
                                {log.status.toUpperCase()}
                            </span>
                            {log.status === 'failed' && log.error_message && (
                                <OverlayTrigger placement="top" overlay={<Tooltip>{log.error_message}</Tooltip>}>
                                    <i className="bi bi-info-circle text-danger ms-2" style={{cursor: 'help'}}></i>
                                </OverlayTrigger>
                            )}
                        </td>
                        <td className="small text-muted">
                            {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                        </td>
                        <td className="pe-4 text-end">
                            {log.invoice_id && (
                                <button className="btn btn-sm btn-white text-primary border" title="View Invoice">
                                    <i className="bi bi-receipt"></i> INV-{log.invoice_id}
                                </button>
                            )}
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="p-3 border-top d-flex justify-content-between align-items-center">
        <span className="text-muted x-small">Total Logs: {data.count}</span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-light border rounded-pill px-3"
            disabled={!data.previous}
            onClick={() => setFilters({...filters, page: filters.page - 1})}
          >Prev</button>
          <button
            className="btn btn-sm btn-light border rounded-pill px-3"
            disabled={!data.next}
            onClick={() => setFilters({...filters, page: filters.page + 1})}
          >Next</button>
        </div>
      </div>
    </div>
  );
}