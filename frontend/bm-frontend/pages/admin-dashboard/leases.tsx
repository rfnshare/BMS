import { useEffect, useState, useMemo } from "react";
import Layout from "../../components/layouts/Layout";
import api from "../../logic/services/apiClient";
import { LeaseService } from "../../logic/services/leaseService";
import { RenterService } from "../../logic/services/renterService";
import { UnitService } from "../../logic/services/unitService";
import { getErrorMessage } from "../../logic/utils/getErrorMessage";
import { Spinner, Badge, Form } from "react-bootstrap";

// Modals & Sub-components
import LeaseModal from "../../components/features/Leases/LeaseModal";
import LeaseDetailsModal from "../../components/features/Leases/LeaseDetailsModal";
import TerminateLeaseModal from "../../components/features/Leases/TerminateLeaseModal";
import RentTypeManager from "../../components/features/Leases/RentTypeManager";
import LeaseDetails from "../../components/features/Leases/LeaseDetails";

// navigation groups
const adminMenuItems = [
    {
        group: "Operations", items: [
            { name: 'Dashboard', path: '/admin-dashboard/home', icon: 'bi-speedometer2' },
            { name: 'Units', path: '/admin-dashboard/units', icon: 'bi-building' },
            { name: 'Leases', path: '/admin-dashboard/leases', icon: 'bi-file-earmark-text' },
            { name: 'Renters', path: '/admin-dashboard/renters', icon: 'bi-people' },
        ]
    },
    {
        group: "Financials", items: [
            { name: 'Invoices', path: '/admin-dashboard/invoices', icon: 'bi-receipt' },
            { name: 'Payments', path: '/admin-dashboard/payments', icon: 'bi-wallet2' },
            { name: 'Expenses', path: '/admin-dashboard/expenses', icon: 'bi-cart-dash' },
        ]
    },
    {
        group: "Support & Intelligence", items: [
            { name: 'Complaints', path: '/admin-dashboard/complaints', icon: 'bi-exclamation-triangle' },
            { name: 'Notifications', path: '/admin-dashboard/notifications', icon: 'bi-bell' },
            { name: 'Reports', path: '/admin-dashboard/reports', icon: 'bi-bar-chart-line' },
        ]
    },
    {
        group: "System", items: [
            { name: 'Permissions', path: '/admin-dashboard/permissions', icon: 'bi-shield-lock' },
            { name: 'Profile', path: '/admin-dashboard/profile', icon: 'bi-person-gear' },
        ]
    },
];

export default function LeasesPage() {
    const [leases, setLeases] = useState<any[]>([]);
    const [renters, setRenters] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewingLease, setViewingLease] = useState<any | null>(null);
    const [activeModal, setActiveModal] = useState<{ type: string | null; data?: any }>({ type: null });
    const [filters, setFilters] = useState({ status: "", search: "" });

    const loadData = async () => {
        setLoading(true);
        try {
            const [lRes, rRes, uRes] = await Promise.all([
                LeaseService.list(filters),
                RenterService.list(),
                UnitService.list(),
            ]);
            setLeases(lRes.results || lRes || []);
            setRenters(rRes.results || rRes || []);
            setUnits(uRes.results || uRes || []);
        } catch (err) {
            console.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [filters.status]);

    const renterMap = useMemo(() => new Map(renters.map(r => [r.id, r])), [renters]);
    const unitMap = useMemo(() => new Map(units.map(u => [u.id, u])), [units]);

    if (viewingLease) {
        return (
            <Layout menuItems={adminMenuItems}>
                <LeaseDetails
                    lease={viewingLease}
                    renter={renterMap.get(viewingLease.renter)}
                    unit={unitMap.get(viewingLease.unit)}
                    onBack={() => {
                        setViewingLease(null);
                        loadData();
                    }}
                />
            </Layout>
        );
    }

    const filteredLeases = leases.filter(l => {
        const term = filters.search.toLowerCase();
        const rName = renterMap.get(l.renter)?.full_name || "";
        const uName = unitMap.get(l.unit)?.name || "";
        return rName.toLowerCase().includes(term) || uName.toLowerCase().includes(term);
    });

    return (
        <Layout menuItems={adminMenuItems}>
            {/* 🔥 FIXED STICKY HEADER
                - top: 70px ensures it sits below the Topbar.
                - z-index: 1020 ensures it slides UNDER the Topbar's profile dropdown (1050).
            */}
            <div className="bg-white border-bottom sticky-top shadow-sm mx-n3 px-3 py-3 mb-3"
                 style={{ zIndex: 1020, top: '70px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold m-0 text-dark">Agreements</h4>
                    <div className="d-flex gap-2">
                        <button className="btn btn-light rounded-pill border"
                                onClick={() => setActiveModal({ type: "rent-types" })}>
                            <i className="bi bi-gear"></i>
                        </button>
                        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                                onClick={() => setActiveModal({ type: "create" })}>
                            + New
                        </button>
                    </div>
                </div>

                <div className="position-relative">
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    <Form.Control
                        className="rounded-pill bg-light border-0 ps-5 py-2"
                        placeholder="Find renter or unit..."
                        style={{ fontSize: '1.1rem' }}
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
            </div>

            {/* KPI BAR */}
            <div className="d-flex gap-2 overflow-auto no-scrollbar py-2 mb-3 mx-n1">
                <Badge bg="white" className="text-primary border p-2 px-3 rounded-pill shadow-sm fw-bold flex-shrink-0">
                    <i className="bi bi-play-circle-fill me-2"></i> {leases.filter(l => l.status === 'active').length} Active
                </Badge>
                <Badge bg="white" className="text-warning border p-2 px-3 rounded-pill shadow-sm fw-bold flex-shrink-0">
                    <i className="bi bi-pencil-square me-2"></i> {leases.filter(l => l.status === 'draft').length} Drafts
                </Badge>
                <Badge bg="white" className="text-danger border p-2 px-3 rounded-pill shadow-sm fw-bold flex-shrink-0">
                    <i className="bi bi-exclamation-circle-fill me-2"></i> ৳{leases.reduce((acc, l) => acc + Number(l.current_balance || 0), 0).toLocaleString()} Dues
                </Badge>
            </div>

            {/* LIST AREA */}
            <div className="mx-n3">
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : (
                    <>
                        {/* MOBILE LIST */}
                        <div className="d-block d-md-none vstack bg-white border-top">
                            {filteredLeases.map((l) => (
                                <div key={l.id} className="p-3 border-bottom bg-white active-highlight">
                                    <div className="d-flex justify-content-between align-items-center mb-3" onClick={() => setViewingLease(l)}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                                style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
                                                {renterMap.get(l.renter)?.full_name?.charAt(0) || "L"}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                                    {renterMap.get(l.renter)?.full_name || "Resident"}
                                                </div>
                                                <div className="text-primary fw-bold small">Unit {unitMap.get(l.unit)?.name || "N/A"}</div>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className={`fw-bold h5 mb-0 ${Number(l.current_balance) > 0 ? 'text-danger' : 'text-success'}`}>
                                                ৳{Number(l.current_balance || 0).toLocaleString()}
                                            </div>
                                            <Badge bg={l.status === 'active' ? 'success' : 'secondary'} className="rounded-pill x-small text-uppercase">
                                                {l.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* MOBILE BUTTONS */}
                                    <div className="d-flex gap-2 pt-2 border-top border-light">
                                        <button className="btn btn-sm btn-light border flex-grow-1 fw-bold text-primary py-2 rounded-pill shadow-sm"
                                            onClick={(e) => { e.stopPropagation(); setViewingLease(l); }}>
                                            <i className="bi bi-speedometer2 me-1"></i> Open
                                        </button>
                                        <button className="btn btn-sm btn-light border flex-grow-1 fw-bold text-dark py-2 rounded-pill shadow-sm"
                                            onClick={(e) => { e.stopPropagation(); setActiveModal({ type: "view", data: l.id }); }}>
                                            <i className="bi bi-eye me-1"></i> View
                                        </button>
                                        <button className="btn btn-sm btn-light border flex-grow-1 fw-bold text-warning py-2 rounded-pill shadow-sm"
                                            onClick={(e) => { e.stopPropagation(); setActiveModal({ type: "edit", data: l }); }}>
                                            <i className="bi bi-pencil-square me-1"></i> Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white mx-3">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light small text-muted text-uppercase fw-bold">
                                        <tr>
                                            <th className="ps-4 py-3">Lease</th>
                                            <th>Renter</th>
                                            <th>Unit</th>
                                            <th className="text-center">Status</th>
                                            <th>Payable</th>
                                            <th className="pe-4 text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLeases.map(l => (
                                            <tr key={l.id}>
                                                <td className="ps-4 fw-bold">#LS-{l.id.toString().padStart(4, '0')}</td>
                                                <td>{renterMap.get(l.renter)?.full_name}</td>
                                                <td>{unitMap.get(l.unit)?.name}</td>
                                                <td className="text-center">
                                                    <Badge bg={l.status === 'active' ? 'success' : 'warning'}
                                                        className="rounded-pill px-3 py-2">{l.status?.toUpperCase()}</Badge>
                                                </td>
                                                <td className="fw-bold text-danger">৳{Number(l.current_balance || 0).toLocaleString()}</td>
                                                <td className="pe-4 text-end">
                                                    <div className="btn-group border rounded-3 bg-white">
                                                        <button className="btn btn-sm px-3" onClick={() => setViewingLease(l)}>
                                                            <i className="bi bi-speedometer2 text-primary"></i>
                                                        </button>
                                                        <button className="btn btn-sm px-3 border-start" onClick={() => setActiveModal({ type: "view", data: l.id })}>
                                                            <i className="bi bi-eye text-primary"></i>
                                                        </button>
                                                        <button className="btn btn-sm px-3 border-start" onClick={() => setActiveModal({ type: "edit", data: l })}>
                                                            <i className="bi bi-pencil-square text-warning"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* MODALS */}
            {(activeModal.type === "create" || activeModal.type === "edit") && (
                <LeaseModal lease={activeModal.data} onClose={() => setActiveModal({ type: null })}
                            onSaved={() => { setActiveModal({ type: null }); loadData(); }} />
            )}
            {activeModal.type === "view" && (
                <LeaseDetailsModal leaseId={activeModal.data} onClose={() => setActiveModal({ type: null })}
                                   renterMap={renterMap} unitMap={unitMap} />
            )}
            {activeModal.type === "rent-types" && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(5px)" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content rounded-4 overflow-hidden border-0 shadow-lg">
                            <div className="modal-header bg-dark text-white p-3">
                                <h6 className="fw-bold m-0">Settings</h6>
                                <button className="btn-close btn-close-white" onClick={() => setActiveModal({ type: null })} />
                            </div>
                            <div className="modal-body p-0"><RentTypeManager /></div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}