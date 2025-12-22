import { useState, useMemo } from "react";
import { useLeases } from "../../../logic/hooks/useLeases";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, InputGroup, Form, Row, Col, Button } from "react-bootstrap";

// Modals & Sub-components
import LeaseModal from "./LeaseModal";
import LeaseDetailsModal from "./LeaseDetailsModal";
import RentTypeManager from "./RentTypeManager";
import LeaseDetails from "./LeaseDetails";

export default function LeaseManager() {
    const { success, error: notifyError } = useNotify();
    const {
        data, renters, units, loading,
        filters, setFilters, refresh, handleDelete
    } = useLeases();

    const [viewingLease, setViewingLease] = useState<any | null>(null);
    const [activeModal, setActiveModal] = useState<{
        type: "create" | "edit" | "view" | "rent-types" | null;
        data?: any
    }>({ type: null });

    const renterMap = useMemo(() => new Map(renters.map(r => [r.id, r])), [renters]);
    const unitMap = useMemo(() => new Map(units.map(u => [u.id, u])), [units]);

    // 🔥 RE-ADDED: Dynamic Stats Calculation
    const stats = useMemo(() => {
        const results = data.results || [];
        return {
            active: results.filter((l: any) => l.status === 'active').length,
            draft: results.filter((l: any) => l.status === 'draft').length,
            terminated: results.filter((l: any) => l.status === 'terminated').length,
            total: data.count || 0,
            totalDue: results.reduce((acc: number, l: any) => acc + Number(l.current_balance || 0), 0)
        };
    }, [data]);

    const confirmDelete = async (id: number) => {
        if (window.confirm("⚠️ Confirm Deletion? This removes all legal and financial history.")) {
            const res = await handleDelete(id);
            if (res.success) success("Lease record removed permanently.");
            else notifyError(res.error || "Failed to delete.");
        }
    };

    if (viewingLease) {
        return (
            <LeaseDetails
                lease={viewingLease}
                renter={renterMap.get(viewingLease.renter)}
                unit={unitMap.get(viewingLease.unit)}
                onBack={() => { setViewingLease(null); refresh(); }}
            />
        );
    }

    return (
        <div className="animate__animated animate__fadeIn">

            {/* 1. HEADER CARD */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div>
                            <h4 className="fw-bold mb-1 text-dark">Lease Agreements</h4>
                            <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1">Contract Management & Legal Records</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="light" className="rounded-pill px-3 fw-bold small border" onClick={() => setActiveModal({type: "rent-types"})}>
                                <i className="bi bi-gear me-2"></i>Configure
                            </Button>
                            <Button className="rounded-pill px-4 fw-bold shadow-sm" onClick={() => setActiveModal({type: 'create'})}>
                                <i className="bi bi-plus-lg me-2"></i>New Lease
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 2. OVERVIEW CARDS (Restored & Improved) */}
            <Row className="g-3 mb-4">
                {[
                    { label: "Active", val: stats.active, color: "primary", icon: "bi-check-circle" },
                    { label: "Drafts", val: stats.draft, color: "warning", icon: "bi-pencil-square" },
                    { label: "Due Balance", val: `৳${stats.totalDue.toLocaleString()}`, color: "danger", icon: "bi-cash-stack" },
                    { label: "Total Records", val: stats.total, color: "info", icon: "bi-archive" }
                ].map((item, i) => (
                    <Col key={i} xs={6} md={3}>
                        <div className={`card border-0 shadow-sm rounded-4 border-start border-4 border-${item.color} h-100 bg-white`}>
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="text-muted fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>{item.label}</div>
                                    <div className={`text-${item.color} opacity-50`}><i className={`bi ${item.icon}`}></i></div>
                                </div>
                                <div className={`h4 fw-bold mb-0 text-${item.color}`}>
                                    {typeof item.val === 'number' ? item.val.toString().padStart(2, '0') : item.val}
                                </div>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* 3. FILTER SECTION */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
                <Row className="g-2">
                    <Col xs={12} md={6}>
                        <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                            <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                            <Form.Control
                                className="bg-light border-0"
                                placeholder="Search renter or unit..."
                                value={filters.search}
                                onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
                            />
                        </InputGroup>
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Select
                            size="sm" className="bg-light border-0 rounded-pill ps-3 text-muted fw-bold"
                            value={filters.status}
                            onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
                        >
                            <option value="">Status: All Agreements</option>
                            <option value="active">Active Only</option>
                            <option value="draft">Drafts</option>
                            <option value="terminated">Terminated</option>
                        </Form.Select>
                    </Col>
                </Row>
            </div>

{/* 3. DESKTOP VIEW */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light border-bottom">
                    <tr className="text-muted x-small fw-bold text-uppercase">
                        <th className="ps-4 py-3">Lease ID</th>
                        <th>Unit / Renter</th>
                        <th>Status</th>
                        <th>Payable</th>
                        <th className="text-end pe-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" size="sm"/></td></tr>
                    ) : data.results.map((l: any) => (
                        <tr key={l.id}>
                            <td className="ps-4">
                                <Button variant="link" className="p-0 fw-bold text-decoration-none small" onClick={() => setViewingLease(l)}>
                                    #LS-{l.id.toString().padStart(4, '0')}
                                </Button>
                                <div className="x-small text-muted">{l.start_date}</div>
                            </td>
                            <td>
                                <div className="fw-bold small text-primary">{unitMap.get(l.unit)?.name || 'N/A'}</div>
                                <div className="text-muted x-small">{renterMap.get(l.renter)?.full_name || 'Internal'}</div>
                            </td>
                            <td>
                                <Badge pill className={`border x-small ${l.status === 'active' ? 'bg-success-subtle text-success border-success' : 'bg-warning-subtle text-warning border-warning'}`}>
                                    {l.status?.toUpperCase()}
                                </Badge>
                            </td>
                            <td className="fw-bold text-danger small">৳{Number(l.current_balance || 0).toLocaleString()}</td>
                            <td className="pe-4 text-end">
                                <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                                    <Button variant="white" className="btn-sm border-end" onClick={() => setViewingLease(l)}><i className="bi bi-speedometer2 text-primary"></i></Button>
                                    <Button variant="white" className="btn-sm border-end" onClick={() => setActiveModal({type: "view", data: l.id})}><i className="bi bi-eye"></i></Button>
                                    <Button variant="white" className="btn-sm border-end" onClick={() => setActiveModal({type: "edit", data: l})}><i className="bi bi-pencil-square text-warning"></i></Button>
                                    <Button variant="white" className="btn-sm text-danger" onClick={() => confirmDelete(l.id)}><i className="bi bi-trash"></i></Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 4. MOBILE VIEW */}
            <div className="d-block d-md-none">
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>
                ) : data.results.map((l: any) => (
                    <div key={l.id} className="p-3 border-bottom bg-white mb-2 shadow-sm rounded-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <Badge pill className={`border x-small ${l.status === 'active' ? 'bg-success-subtle text-success border-success' : 'bg-warning-subtle text-warning border-warning'}`}>
                                {l.status?.toUpperCase()}
                            </Badge>
                            <div className="btn-group">
                                <Button variant="light" size="sm" className="border py-1" onClick={() => setActiveModal({type: 'edit', data: l})}><i className="bi bi-pencil-square text-warning"></i></Button>
                                <Button variant="light" size="sm" className="border text-danger py-1" onClick={() => confirmDelete(l.id)}><i className="bi bi-trash"></i></Button>
                            </div>
                        </div>
                        <div className="fw-bold text-dark mb-1">#LS-{l.id.toString().padStart(4, '0')} — {renterMap.get(l.renter)?.full_name}</div>
                        <div className="d-flex justify-content-between align-items-end mt-2">
                            <div className="x-small text-muted">
                                <div><i className="bi bi-house-door me-1"></i>{unitMap.get(l.unit)?.name}</div>
                                <div className="fw-bold text-danger mt-1">৳{Number(l.current_balance || 0).toLocaleString()}</div>
                            </div>
                            <Button variant="primary" size="sm" className="rounded-pill px-3" onClick={() => setViewingLease(l)}>Dashboard</Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 5. PAGINATION FOOTER */}
            {!loading && data.total_pages > 1 && (
                <div className="d-flex justify-content-between align-items-center bg-white p-3 border-top rounded-bottom-4">
                    <span className="text-muted x-small">Page <b>{data.current_page}</b> of <b>{data.total_pages}</b></span>
                    <div className="d-flex gap-2">
                        <Button variant="white" size="sm" className="border rounded-pill px-3 shadow-sm" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>Prev</Button>
                        <Button variant="white" size="sm" className="border rounded-pill px-3 shadow-sm" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</Button>
                    </div>
                </div>
            )}

            {/* MODAL SYSTEM */}
            {(activeModal.type === 'create' || activeModal.type === 'edit') && (
                <LeaseModal
                    lease={activeModal.data}
                    onClose={() => setActiveModal({type: null})}
                    onSuccess={() => {
                        success(activeModal.type === 'edit' ? "Lease updated." : "New lease agreement created.");
                        setActiveModal({type: null});
                        refresh();
                    }}
                />
            )}
            {activeModal.type === "view" && <LeaseDetailsModal leaseId={activeModal.data} onClose={() => setActiveModal({type: null})} renterMap={renterMap} unitMap={unitMap} />}
            {activeModal.type === "rent-types" && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(5px)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content rounded-4 overflow-hidden border-0 shadow-lg">
                            <div className="modal-header bg-dark text-white p-3">
                                <h6 className="modal-title fw-bold">⚙️ Lease Configuration</h6>
                                <button className="btn-close btn-close-white" onClick={() => setActiveModal({type: null})} />
                            </div>
                            <div className="modal-body p-0"><RentTypeManager /></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}