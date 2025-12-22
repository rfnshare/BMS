import { useState, useMemo } from "react";
import { useComplaints } from "../../../logic/hooks/useComplaints";
import { ComplaintService } from "../../../logic/services/complaintService";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, InputGroup, Form, Row, Col, Button } from "react-bootstrap";
import ComplaintModal from "./ComplaintModal";

export default function ComplaintManager() {
    const { success, error: notifyError } = useNotify();

    const { data, loading, filters, setFilters, refresh } = useComplaints({
        status: "", priority: "", search: "", page: 1, ordering: "-priority"
    });

    const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'create' | null, data: any }>({
        type: null,
        data: null
    });

    // 1. INCIDENT KPI STATS (Blueprint Logic)
    const stats = useMemo(() => {
        const results = data.results || [];
        return {
            total: data.count || 0,
            pending: results.filter((c: any) => c.status === 'pending').length,
            critical: results.filter((c: any) => c.priority === 'critical').length,
            resolved: results.filter((c: any) => c.status === 'resolved' || c.status === 'closed').length,
        };
    }, [data]);

    const handleDelete = async (id: number) => {
        if (window.confirm("⚠️ Audit Action: Resolve or Delete this incident record permanently?")) {
            try {
                await ComplaintService.destroy(id);
                success("Incident record purged from ledger.");
                refresh();
            } catch (err) {
                notifyError("Action Denied: Could not remove ticket.");
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const map: any = {
            'pending': 'bg-warning-subtle text-warning border-warning',
            'in_progress': 'bg-primary-subtle text-primary border-primary',
            'resolved': 'bg-success-subtle text-success border-success',
            'closed': 'bg-secondary-subtle text-secondary border-secondary'
        };
        return map[status] || 'bg-light';
    };

    const getPriorityBadge = (prio: string) => {
        const map: any = {
            'low': 'bg-light text-muted border-light',
            'medium': 'bg-info-subtle text-info border-info',
            'high': 'bg-warning-subtle text-dark fw-bold border-warning',
            'critical': 'bg-danger text-white fw-bold animate__animated animate__pulse animate__infinite border-danger'
        };
        return map[prio] || 'bg-light';
    };

    return (
        <div className="animate__animated animate__fadeIn">

            {/* 2. INDUSTRIAL HEADER (Right-Aligned Actions) */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
                                <i className="bi bi-chat-dots fs-4"></i>
                            </div>
                            <div>
                                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Incident Management</h4>
                                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Infrastructure Maintenance & Resident Requests</p>
                            </div>
                        </div>
                        <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
                            <Button
                                variant="primary"
                                className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0"
                                onClick={() => setActiveModal({type: 'create', data: null})}
                            >
                                <i className="bi bi-plus-lg"></i>
                                <span>NEW TICKET</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. INCIDENT KPI OVERVIEW */}
            <Row className="g-2 g-md-3 mb-4">
                {[
                    { label: "Active Tickets", val: stats.total, color: "primary", icon: "bi-clipboard-data" },
                    { label: "Critical Priority", val: stats.critical, color: "danger", icon: "bi-exclamation-triangle" },
                    { label: "Pending Review", val: stats.pending, color: "warning", icon: "bi-hourglass-split" },
                    { label: "Resolved Month", val: stats.resolved, color: "success", icon: "bi-check2-circle" },
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
                    <Col xs={12} md={4}>
                        <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                            <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                            <Form.Control
                                className="bg-light border-0 py-2 shadow-none fw-medium"
                                placeholder="Search incident subject..."
                                onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
                            />
                        </InputGroup>
                    </Col>
                    <Col xs={6} md={4}>
                        <Form.Select
                            size="sm" className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none"
                            onChange={e => setFilters({...filters, priority: e.target.value, page: 1})}
                        >
                            <option value="">Priority: All Levels</option>
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="critical">Critical Severity</option>
                        </Form.Select>
                    </Col>
                    <Col xs={6} md={4}>
                        <Form.Select
                            size="sm" className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none"
                            onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
                        >
                            <option value="">Status: All Active</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed Archive</option>
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            {/* 5. DATA VIEW: INDUSTRIAL TABLE (Desktop) */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light border-bottom">
                    <tr className="text-muted x-small fw-bold text-uppercase ls-1">
                        <th className="ps-4 py-3">Incident Record</th>
                        <th>Asset & Renter</th>
                        <th className="text-center">Severity</th>
                        <th className="text-center">Lifecycle</th>
                        <th className="text-end pe-4">Management</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && data.results?.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" size="sm"/></td>
                        </tr>
                    ) : data.results.map((c: any) => (
                        <tr key={c.id}>
                            <td className="ps-4">
                                <div className="fw-bold text-dark small">{c.title}</div>
                                <div className="text-muted x-small fw-bold ls-1 font-monospace">{new Date(c.created_at).toLocaleDateString()}</div>
                            </td>
                            <td>
                                <div className="fw-bold small text-primary">{c.unit_name || 'General Area'}</div>
                                <div className="text-muted x-small fw-bold ls-1 text-uppercase">{c.renter_name || 'Internal Staff'}</div>
                            </td>
                            <td className="text-center">
                                <Badge pill className={`border x-small px-3 py-2 fw-bold ls-1 ${getPriorityBadge(c.priority)}`}>
                                    {c.priority.toUpperCase()}
                                </Badge>
                            </td>
                            <td className="text-center">
                                <Badge pill className={`border x-small px-3 py-2 fw-bold ls-1 ${getStatusBadge(c.status)}`}>
                                    {c.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </td>
                            <td className="pe-4 text-end">
                                <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                                    <Button variant="white" className="btn-sm border-end px-3"
                                            onClick={() => setActiveModal({type: 'edit', data: c})} title="Edit Ticket"><i
                                        className="bi bi-pencil-square text-warning"></i></Button>
                                    <Button variant="white" className="btn-sm px-3 text-danger"
                                            onClick={() => handleDelete(c.id)} title="Delete Ticket"><i className="bi bi-trash"></i></Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 6. MOBILE ACTION CARDS */}
            <div className="d-block d-md-none vstack gap-2 p-2">
                {loading && data.results?.length === 0 ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>
                ) : data.results?.map((c: any) => (
                    <div key={c.id} className={`card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 ${c.priority === 'critical' ? 'border-danger' : 'border-primary'} animate__animated animate__fadeIn`}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <Badge pill className={`border x-small fw-bold ls-1 ${getPriorityBadge(c.priority)}`}>
                                {c.priority?.toUpperCase()}
                            </Badge>
                            <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                                <Button variant="white" className="btn-sm px-3 py-1" onClick={() => setActiveModal({type: 'edit', data: c})}><i className="bi bi-pencil-square text-warning"></i></Button>
                                <Button variant="white" className="btn-sm px-3 py-1 text-danger" onClick={() => handleDelete(c.id)}><i className="bi bi-trash"></i></Button>
                            </div>
                        </div>

                        <div className="fw-bold text-dark mb-1">{c.title}</div>

                        <div className="d-flex justify-content-between align-items-end mt-2">
                            <div className="x-small text-muted fw-bold ls-1 text-uppercase">
                                <div className="mb-1"><i className="bi bi-house-door me-1"></i>{c.unit_name || 'General Area'}</div>
                                <div><i className="bi bi-person me-1"></i>{c.renter_name || 'Internal'}</div>
                            </div>
                            <div className="text-end">
                                <Badge pill className={`border x-small d-block mb-1 fw-bold ls-1 ${getStatusBadge(c.status)}`}>
                                    {c.status?.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <span className="text-muted fw-bold ls-1" style={{fontSize: '0.6rem'}}>
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 7. ADAPTIVE PAGINATION */}
            <div className="p-3 bg-white rounded-4 shadow-sm border d-flex justify-content-between align-items-center mt-3 mb-5">
                <span className="text-muted x-small fw-bold ls-1 text-uppercase">Incident Total: {data.count} entries</span>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" size="sm" className="rounded-pill px-4 fw-bold ls-1" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>PREV</Button>
                    <Button variant="outline-secondary" size="sm" className="rounded-pill px-4 fw-bold ls-1" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>NEXT</Button>
                </div>
            </div>

            {/* MODAL SYSTEM */}
            {(activeModal.type === 'create' || activeModal.type === 'edit') && (
                <ComplaintModal
                    complaint={activeModal.data}
                    onClose={() => setActiveModal({type: null, data: null})}
                    onSuccess={() => {
                        setActiveModal({type: null, data: null});
                        refresh();
                    }}
                />
            )}
        </div>
    );
}