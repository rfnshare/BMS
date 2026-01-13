import { useEffect, useState, useCallback, useRef } from "react";
import { NotificationService } from "../../../logic/services/notificationService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge, Form, Container } from "react-bootstrap";

export default function NotificationManager() {
    const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
    const [loading, setLoading] = useState(true);

    const [uiSearch, setUiSearch] = useState("");
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        channel: "",
        notification_type: "",
        page: 1,
        ordering: "-sent_at"
    });

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: uiSearch, page: 1 }));
        }, 500);
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, [uiSearch]);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await NotificationService.list(filters);
            setData(res);
        } catch (err: any) {
            console.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { loadNotifications(); }, [loadNotifications]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent': return 'bg-success text-white';
            case 'failed': return 'bg-danger text-white';
            default: return 'bg-warning text-dark border';
        }
    };

    return (
        <div className="bg-light min-vh-100 position-relative" style={{ paddingBottom: '100px' }}>

            {/* 1. STICKY HEADER */}
            <div className="sticky-top bg-white border-bottom shadow-sm px-3 py-3 mb-3" style={{ zIndex: 1015, top: '0px' }}>
                <Container className="px-0" style={{ maxWidth: '800px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold m-0 text-dark">Communication Logs</h5>
                        <button className="btn btn-light border-0 text-primary" onClick={loadNotifications} disabled={loading}>
                            {loading ? <Spinner size="sm" /> : <i className="bi bi-arrow-clockwise fs-5"></i>}
                        </button>
                    </div>

                    <div className="d-flex gap-2">
                        <input
                            className="form-control rounded-pill bg-light border-0 px-3 flex-grow-1 shadow-none"
                            placeholder="Search renter..."
                            style={{ fontSize: '0.9rem' }}
                            value={uiSearch}
                            onChange={(e) => setUiSearch(e.target.value)}
                        />
                        <Form.Select
                            className="rounded-pill bg-light border-0 fw-bold text-muted w-auto shadow-none"
                            style={{ fontSize: '0.85rem' }}
                            value={filters.status}
                            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        >
                            <option value="">Status</option>
                            <option value="sent">Sent</option>
                            <option value="failed">Failed</option>
                        </Form.Select>
                    </div>
                </Container>
            </div>

            {/* 2. MAIN LOG CONTENT */}
            <Container className="px-2 px-md-0" style={{ maxWidth: '800px' }}>
                <div className="vstack gap-3">
                    {loading && data.results.length === 0 ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : data.results.length === 0 ? (
                        <div className="text-center py-5 text-muted small italic bg-white rounded-4 border p-4 shadow-sm">
                            <i className="bi bi-search d-block fs-1 opacity-25 mb-2"></i>
                            No logs found for &ldquo;{filters.search || filters.status}&rdquo;
                        </div>
                    ) : (
                        data.results.map((log: any) => (
                            <div key={log.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white animate__animated animate__fadeIn">
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                                        <div className="d-flex align-items-center gap-3 min-vw-0">
                                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                                                <i className={`bi bi-${log.channel === 'whatsapp' ? 'whatsapp text-success' : 'envelope-at text-primary'} fs-5`}></i>
                                            </div>
                                            <div className="text-truncate">
                                                <div className="fw-bold text-dark small lh-1 text-truncate">{log.renter_name || "System Alert"}</div>
                                                <div className="text-muted x-small font-monospace mt-1 text-truncate">{log.recipient}</div>
                                            </div>
                                        </div>
                                        <div className="text-end flex-shrink-0">
                                            <Badge className={`rounded-pill px-2 py-1 x-small text-uppercase border-0 ${getStatusBadge(log.status)}`}>
                                                {log.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="bg-light p-3 rounded-3 mb-3 border border-light-subtle">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="fw-bold text-primary text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                                                {log.notification_type?.replace(/_/g, ' ')}
                                            </div>
                                            {log.invoice_number && <div className="fw-bold text-dark x-small">{log.invoice_number}</div>}
                                        </div>
                                        <div className="fw-bold text-dark" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>{log.subject || "Security Alert"}</div>
                                    </div>

                                    {/* Error Message Block */}
                                    {log.status === 'failed' && (
                                        <div className="p-2 px-3 bg-danger bg-opacity-10 text-danger rounded-3 mb-3 border border-danger border-opacity-10"
                                            style={{ fontSize: '0.75rem', fontWeight: '600', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                                            <div className="d-flex align-items-start">
                                                <i className="bi bi-exclamation-triangle-fill me-2 mt-1 flex-shrink-0"></i>
                                                <span>{log.error_message || "Delivery Failed"}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 🚀 RESPONSIVE FOOTER: Re-seated task_log_name here */}
                                    <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light opacity-75">
                                        {/* Time column */}
                                        <div style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                                            <i className="bi bi-clock me-1"></i>
                                            {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                        </div>

                                        {/* Middle column: Task Log Name */}
                                        {log.task_log_name && (
                                            <div className="text-muted px-2 text-truncate text-center" style={{ fontSize: '0.6rem', fontWeight: 'bold', flex: '1 1 auto', minWidth: 0 }}>
                                                <i className="bi bi-gear-fill me-1"></i>
                                                {log.task_log_name}
                                            </div>
                                        )}

                                        {/* User column */}
                                        <div style={{ fontSize: '0.65rem', flexShrink: 0 }} className="text-end">
                                            <i className="bi bi-person-circle me-1"></i>
                                            {log.sent_by_name?.split(' ')[0] || 'System'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Container>

            {/* 3. PAGINATION FOOTER */}
            <div className="fixed-bottom bg-white border-top p-3 shadow-lg" style={{ zIndex: 1020 }}>
                <Container className="px-0 d-flex justify-content-between align-items-center" style={{ maxWidth: '800px' }}>
                    <span className="text-muted small">Total: <b>{data.count}</b></span>
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-light border rounded-pill px-4" disabled={!data.previous || loading} onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}>Back</button>
                        <button className="btn btn-sm btn-light border rounded-pill px-4" disabled={!data.next || loading} onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}>Next</button>
                    </div>
                </Container>
            </div>
        </div>
    );
}