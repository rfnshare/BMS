import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { LeaseService } from "../../../logic/services/leaseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

// Sub-components
import LeaseModal from "./LeaseModal";
import LeaseDetailsModal from "./LeaseDetailsModal";
import LeaseDetails from "./LeaseDetails";

export default function LeaseManager() {
  const [leases, setLeases] = useState<any[]>([]);
  const [renters, setRenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingLease, setViewingLease] = useState<any | null>(null);
  const [filters, setFilters] = useState({ status: "", search: "" });

  // 🔥 NEW: Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 🔥 NEW: Enhanced Modal State
  const [activeModal, setActiveModal] = useState<{ type: "create" | "view" | "terminate" | null; data?: any }>({ type: null });

  // ========================
  // 1. Data Loading Logic
  // ========================
  const loadData = async (page: number = 1) => {
    setLoading(true);
    try {
      const [lRes, rRes, uRes] = await Promise.all([
        // 🔥 Passing page to service
        LeaseService.list({ ...filters, page }),
        api.get("/renters/renters/?limit=1000").then(r => r.data),
        api.get("/buildings/units/?limit=1000").then(r => r.data),
      ]);

      // Update Lease Data & Pagination Meta
      setLeases(lRes.results || lRes || []);
      setTotalCount(lRes.count || 0);
      setTotalPages(lRes.total_pages || 1);

      setRenters(rRes.results || rRes || []);
      setUnits(uRes.results || uRes || []);
    } catch (err) {
        console.error(getErrorMessage(err));
    } finally {
        setLoading(false);
    }
  };

  // 🔥 Trigger load on page change or status filter
  useEffect(() => { loadData(currentPage); }, [currentPage, filters.status]);

  const renterMap = useMemo(() => new Map(renters.map(r => [r.id, r])), [renters]);
  const unitMap = useMemo(() => new Map(units.map(u => [u.id, u])), [units]);

  // ========================
  // 2. Navigation Override
  // ========================
  if (viewingLease) {
    return (
      <LeaseDetails
        lease={viewingLease}
        renter={renterMap.get(viewingLease.renter)}
        unit={unitMap.get(viewingLease.unit)}
        onBack={() => { setViewingLease(null); loadData(currentPage); }}
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

      {/* 3. STATS OVERVIEW */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-primary border-4 bg-white">
            <div className="text-muted small fw-bold">ACTIVE LEASES</div>
            <div className="h3 fw-bold mb-0 text-primary">
                {leases.filter(l => l.status === 'active').length}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-danger border-4 bg-white">
            <div className="text-muted small fw-bold">DUE BALANCE</div>
            <div className="h3 fw-bold mb-0 text-danger">
                ৳{leases.reduce((acc, l) => acc + Number(l.current_balance || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABLE SECTION */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
           <h5 className="fw-bold mb-0">Lease Records</h5>
           <div className="d-flex gap-2">
              <input
                className="form-control form-control-sm border-light shadow-sm"
                placeholder="Search Renter or Unit..."
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
              <button className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={() => setActiveModal({type: 'create'})}>
                <i className="bi bi-plus-lg me-1"></i> New Lease
              </button>
           </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light small text-muted text-uppercase fw-bold">
              <tr>
                <th className="ps-4 py-3">Lease ID</th>
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
                  <td className="ps-4">
                    <button className="btn btn-link p-0 text-decoration-none fw-bold" onClick={() => setViewingLease(l)}>
                      Lease #{l.id}
                    </button>
                    <div className="x-small text-muted">{l.start_date}</div>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{renterMap.get(l.renter)?.full_name || `ID: ${l.renter}`}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{renterMap.get(l.renter)?.phone_number}</div>
                  </td>
                  <td><span className="badge bg-light text-dark border px-3 py-2 fw-medium">{unitMap.get(l.unit)?.name || `ID: ${l.unit}`}</span></td>
                  <td className="text-center">
                    <span className={`badge rounded-pill px-3 py-2 border ${l.status === 'active' ? 'bg-success-subtle text-success border-success' : 'bg-danger-subtle text-danger border-danger'}`}>
                      {l.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className={`fw-bold ${Number(l.current_balance) > 0 ? 'text-danger' : 'text-success'}`}>
                    ৳{Number(l.current_balance || 0).toLocaleString()}
                  </td>
                  <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm border rounded-3 bg-white">
                      <button className="btn btn-sm px-3" onClick={() => setViewingLease(l)} title="Dashboard"><i className="bi bi-speedometer2 text-primary"></i></button>
                      <button className="btn btn-sm px-3 border-start" onClick={() => setActiveModal({type: "view", data: l.id})} title="View"><i className="bi bi-eye"></i></button>
                      {/* 🔥 Termination Action */}
                      {l.status === 'active' && (
                        <button className="btn btn-sm px-3 border-start" onClick={() => setActiveModal({type: "terminate", data: l})} title="Terminate">
                          <i className="bi bi-slash-circle text-danger"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION CONTROLS */}
        {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center bg-white p-3 border-top">
                <div className="small text-muted">
                    Page <b>{currentPage}</b> of <b>{totalPages}</b> ({totalCount} total)
                </div>
                <nav>
                    <ul className="pagination pagination-sm mb-0 gap-1">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        )}
      </div>

      {/* 6. MODALS */}
      {activeModal.type === "create" && <LeaseModal onClose={() => setActiveModal({type: null})} onSaved={() => loadData(currentPage)} />}

      {activeModal.type === "view" && <LeaseDetailsModal leaseId={activeModal.data} onClose={() => setActiveModal({type: null})} renterMap={renterMap} unitMap={unitMap} />}

    </div>
  );
}