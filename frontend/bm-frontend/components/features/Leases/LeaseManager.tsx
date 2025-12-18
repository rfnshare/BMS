import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { LeaseService } from "../../../logic/services/leaseService";
import { RenterService } from "../../../logic/services/renterService";
import { UnitService } from "../../../logic/services/unitService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

// Sub-components
import LeaseModal from "./LeaseModal";
import LeaseDetailsModal from "./LeaseDetailsModal";
import LeaseDetails from "./LeaseDetails"; // The new full dashboard

export default function LeaseManager() {
  const [leases, setLeases] = useState<any[]>([]);
  const [renters, setRenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingLease, setViewingLease] = useState<any | null>(null);
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [activeModal, setActiveModal] = useState<{ type: string | null; data?: any }>({ type: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const [lRes, rRes, uRes] = await Promise.all([
        LeaseService.list(filters),
        api.get("/renters/renters/?limit=1000").then(r => r.data),
        api.get("/buildings/units/?limit=1000").then(r => r.data),
      ]);
      setLeases(lRes.results || lRes || []);
      setRenters(rRes.results || rRes || []);
      setUnits(uRes.results || uRes || []);
    } catch (err) { console.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.status]);

  const renterMap = useMemo(() => new Map(renters.map(r => [r.id, r])), [renters]);
  const unitMap = useMemo(() => new Map(units.map(u => [u.id, u])), [units]);

  // 🔥 1. If a lease is selected, show the Dashboard instead of the list
  if (viewingLease) {
    return (
      <LeaseDetails
        lease={viewingLease}
        renter={renterMap.get(viewingLease.renter)}
        unit={unitMap.get(viewingLease.unit)}
        onBack={() => { setViewingLease(null); loadData(); }}
      />
    );
  }

  const filteredLeases = leases.filter(l => {
    const term = filters.search.toLowerCase();
    const rName = renterMap.get(l.renter)?.full_name || "";
    const uName = unitMap.get(l.unit)?.name || "";
    return rName.toLowerCase().includes(term) || uName.toLowerCase().includes(term);
  });

  return (
    <div className="animate__animated animate__fadeIn">
      {/* 2. STATS OVERVIEW */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-primary border-4">
            <div className="text-muted small fw-bold">ACTIVE LEASES</div>
            <div className="h3 fw-bold mb-0">{leases.filter(l => l.status === 'active').length}</div>
          </div>
        </div>
        {/* ... Other stats as needed ... */}
      </div>

      {/* 3. TABLE SECTION */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
           <h5 className="fw-bold mb-0">Lease Records</h5>
           <div className="d-flex gap-2">
              <input
                className="form-control form-control-sm"
                placeholder="Search..."
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
              <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setActiveModal({type: 'create'})}>
                <i className="bi bi-plus-lg me-1"></i> New Lease
              </button>
           </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light small text-muted text-uppercase">
              <tr>
                <th className="ps-4">Lease ID</th>
                <th>Renter Profile</th>
                <th>Unit</th>
                <th className="text-center">Status</th>
                <th>Balance</th>
                <th className="pe-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
              ) : filteredLeases.map((l) => (
                <tr key={l.id}>
                  {/* 🔥 CLICKABLE LEASE ID */}
                  <td className="ps-4">
                    <button className="btn btn-link p-0 text-decoration-none fw-bold" onClick={() => setViewingLease(l)}>
                      Lease #{l.id}
                    </button>
                  </td>
                  <td>
                    <div className="fw-bold">{renterMap.get(l.renter)?.full_name || `ID: ${l.renter}`}</div>
                    <div className="text-muted small">{renterMap.get(l.renter)?.phone_number}</div>
                  </td>
                  <td><span className="badge bg-light text-dark border px-3 py-2">{unitMap.get(l.unit)?.name || `ID: ${l.unit}`}</span></td>
                  <td className="text-center">
                    <span className={`badge rounded-pill px-3 py-2 border ${l.status === 'active' ? 'bg-success-subtle text-success border-success' : 'bg-warning-subtle text-warning border-warning'}`}>
                      {l.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="fw-bold text-danger">৳{Number(l.current_balance || 0).toLocaleString()}</td>
                  <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm border rounded-3 bg-white">
                      <button className="btn btn-sm px-3" onClick={() => setViewingLease(l)} title="Dashboard"><i className="bi bi-speedometer2 text-primary"></i></button>
                      <button className="btn btn-sm px-3 border-start" onClick={() => setActiveModal({type: "view", data: l.id})}><i className="bi bi-eye"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODALS */}
      {activeModal.type === "create" && <LeaseModal onClose={() => setActiveModal({type: null})} onSaved={loadData} />}
      {activeModal.type === "view" && <LeaseDetailsModal leaseId={activeModal.data} onClose={() => setActiveModal({type: null})} renterMap={renterMap} unitMap={unitMap} />}
    </div>
  );
}