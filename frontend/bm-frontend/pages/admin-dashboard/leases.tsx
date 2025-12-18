import { useEffect, useState, useMemo } from "react";
import Layout from "../../components/layouts/Layout";
import api from "../../logic/services/apiClient";
import { LeaseService } from "../../logic/services/leaseService";
import { RenterService } from "../../logic/services/renterService";
import { UnitService } from "../../logic/services/unitService";
import { getErrorMessage } from "../../logic/utils/getErrorMessage";

// Modals
import LeaseModal from "../../components/features/Leases/LeaseModal";
import LeaseDetailsModal from "../../components/features/Leases/LeaseDetailsModal";
import TerminateLeaseModal from "../../components/features/Leases/TerminateLeaseModal";
import RentTypeManager from "../../components/features/Leases/RentTypeManager";
// 🔥 ADD THIS IMPORT
import LeaseDetails from "../../components/features/Leases/LeaseDetails";

const menuItems = [
  { name: "Home", path: "/admin-dashboard/home", icon: "bi-house" },
  { name: "Units", path: "/admin-dashboard/units", icon: "bi-building" },
  { name: "Renters", path: "/admin-dashboard/renters", icon: "bi-people" },
  { name: "Leases", path: "/admin-dashboard/leases", icon: "bi-file-text" },
  { name: "Invoices", path: "/admin-dashboard/invoices", icon: "bi-receipt" },
  { name: "Notifications", path: "/admin-dashboard/notifications", icon: "bi-bell" },
  { name: "Reports", path: "/admin-dashboard/reports", icon: "bi-bar-chart" },
  { name: "Profile", path: "/admin-dashboard/profile", icon: "bi-person" },
];

export default function LeasesPage() {
  // 1. DATA STATES
  const [leases, setLeases] = useState<any[]>([]);
  const [renters, setRenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 NEW STATE FOR DASHBOARD
  const [viewingLease, setViewingLease] = useState<any | null>(null);

  // 2. MODAL & FILTER STATES
  const [activeModal, setActiveModal] = useState<{ type: "create" | "edit" | "view" | "terminate" | "rent-types" | null; data?: any }>({ type: null });
  const [filters, setFilters] = useState({ status: "", search: "" });

  // 3. LOAD DATA
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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filters.status]);

  // 4. LOOKUP OPTIMIZATION
  const renterMap = useMemo(() => new Map(renters.map(r => [r.id, r])), [renters]);
  const unitMap = useMemo(() => new Map(units.map(u => [u.id, u])), [units]);

  const stats = useMemo(() => ({
    active: leases.filter(l => l.status === 'active').length,
    draft: leases.filter(l => l.status === 'draft').length,
    terminated: leases.filter(l => l.status === 'terminated').length,
    total: leases.length
  }), [leases]);

  // 🔥 VIEW SWITCHER LOGIC
  // This detects if we should show the Dashboard page instead of the list
  if (viewingLease) {
    return (
      <Layout menuItems={menuItems}>
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
    const rName = renterMap.get(l.renter)?.full_name || `Renter #${l.renter}`;
    const uName = unitMap.get(l.unit)?.name || `Unit #${l.unit}`;
    return rName.toLowerCase().includes(term) || uName.toLowerCase().includes(term);
  });

  const handleDelete = async (id: number) => {
    if (confirm("⚠️ Confirm Deletion? This will remove all legal and financial history.")) {
      await LeaseService.destroy(id);
      loadData();
    }
  };

  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">

        {/* 1. HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">Lease Agreements</h2>
            <p className="text-muted mb-0">Manage {stats.active} active contracts and legal documentation.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setActiveModal({type: "rent-types"})}>
               <i className="bi bi-gear me-2"></i>Configure
            </button>
            <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" onClick={() => setActiveModal({type: "create"})}>
              <i className="bi bi-plus-lg me-2"></i>New Lease
            </button>
          </div>
        </div>

        {/* 2. REAL-TIME OVERVIEW CARDS */}
        <div className="row g-3 mb-4">
          {[
            { label: "Active", val: stats.active, color: "primary", icon: "bi-check-circle" },
            { label: "Drafts", val: stats.draft, color: "warning", icon: "bi-pencil-square" },
            { label: "Terminated", val: stats.terminated, color: "danger", icon: "bi-x-circle" },
            { label: "Total History", val: stats.total, color: "info", icon: "bi-archive" }
          ].map((item, i) => (
            <div key={i} className="col-md-3">
              <div className={`card border-0 shadow-sm rounded-4 border-start border-4 border-${item.color} h-100`}>
                <div className="card-body p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small fw-bold">{item.label}</div>
                    <div className={`h3 fw-bold mb-0 text-${item.color}`}>{item.val.toString().padStart(2, '0')}</div>
                  </div>
                  <div className={`bg-${item.color} bg-opacity-10 p-2 rounded-3 text-${item.color}`}>
                    <i className={`bi ${item.icon} fs-4`}></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. MAIN TABLE SECTION */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white border-0 pt-4 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-text text-primary"></i> Contract Records
            </h5>
            <div className="d-flex gap-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-0"><i className="bi bi-search"></i></span>
                <input
                   type="text" className="form-control bg-light border-0" placeholder="Search Renter/Unit..."
                   value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}
                />
              </div>
              <select
                 className="form-select form-select-sm bg-light border-0"
                 value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="card-body p-0 mt-3">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr className="text-muted small text-uppercase">
                    {/* 🔥 NEW COLUMN */}
                    <th className="ps-4 py-3">Lease ID</th>
                    <th>Renter Profile</th>
                    <th>Unit</th>
                    <th className="text-center">Status</th>
                    <th>Payable</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                  ) : filteredLeases.map((l) => (
                    <tr key={l.id}>
                      {/* 🔥 NEW CLICKABLE ID COLUMN */}
                      <td className="ps-4">
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-bold text-primary"
                          onClick={() => setViewingLease(l)}
                        >
                          Lease #{l.id}
                        </button>
                      </td>

                      <td>
                        <div className="fw-bold text-dark">{renterMap.get(l.renter)?.full_name || `Renter #${l.renter}`}</div>
                        <div className="text-muted small">{renterMap.get(l.renter)?.phone_number || "No contact"}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border px-3 py-2">{unitMap.get(l.unit)?.name || `Unit #${l.unit}`}</span></td>
                      <td className="text-center">
                        <span className={`badge rounded-pill border px-3 py-2 ${l.status === 'active' ? 'bg-success-subtle text-success border-success' : 'bg-warning-subtle text-warning border-warning'}`}>
                          {l.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="fw-bold text-danger">৳{Number(l.current_balance || 0).toLocaleString()}</td>
                      <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                          {/* 🔥 ADD DASHBOARD ICON TO ACTIONS */}
                          <button
                            className="btn btn-sm px-3 border-end"
                            onClick={() => setViewingLease(l)}
                            title="Dashboard"
                          >
                            <i className="bi bi-speedometer2 text-primary"></i>
                          </button>

                          <button className="btn btn-sm px-3" onClick={() => setActiveModal({type: "view", data: l.id})}><i className="bi bi-eye text-primary"></i></button>
                          <button className="btn btn-sm px-3 border-start" onClick={() => setActiveModal({type: "edit", data: l})}><i className="bi bi-pencil-square text-warning"></i></button>
                          <button className="btn btn-sm px-3 border-start" onClick={() => handleDelete(l.id)}><i className="bi bi-trash3 text-danger"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. HELP BOX */}
        <div className="mt-4 p-3 rounded-4 bg-white border d-flex align-items-center gap-3 shadow-sm">
          <i className="bi bi-info-circle text-primary fs-5"></i>
          <span className="small text-muted">
            All data shown is live from the server. Use the <strong>Configure</strong> button to update billing categories.
          </span>
        </div>

        {/* 5. MODAL SYSTEM */}
        {(activeModal.type === "create" || activeModal.type === "edit") && (
          <LeaseModal
            lease={activeModal.data}
            onClose={() => setActiveModal({type: null})}
            onSaved={() => { setActiveModal({type: null}); loadData(); }}
          />
        )}
        {activeModal.type === "view" && (
          <LeaseDetailsModal leaseId={activeModal.data} onClose={() => setActiveModal({type: null})} renterMap={renterMap} unitMap={unitMap} />
        )}
        {activeModal.type === "rent-types" && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(5px)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content rounded-4 overflow-hidden border-0 shadow-lg">
              <div className="modal-header bg-dark text-white p-4">
                <h5 className="modal-title fw-bold">⚙️ Global Configuration</h5>
                <button className="btn-close btn-close-white" onClick={() => setActiveModal({type: null})} />
              </div>
              <div className="modal-body p-0"><RentTypeManager /></div>
            </div></div>
          </div>
        )}
      </div>
    </Layout>
  );
}