import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { LeaseService } from "../../../logic/services/leaseService";
import { RenterService } from "../../../logic/services/renterService";
import { UnitService } from "../../../logic/services/unitService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

// Local Sub-components
import LeaseModal from "./LeaseModal";
import LeaseDetailsModal from "./LeaseDetailsModal";
import RentTypeManager from "./RentTypeManager";
import LeaseDetails from "./LeaseDetails";

export default function LeaseManager() {
  // 1. DATA STATES
  const [data, setData] = useState<any>({
    results: [], count: 0, total_pages: 1, current_page: 1, next: null, previous: null
  });
  const [renters, setRenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewingLease, setViewingLease] = useState<any | null>(null);
  const [activeModal, setActiveModal] = useState<{
    type: "create" | "edit" | "view" | "terminate" | "rent-types" | null;
    data?: any
  }>({ type: null });

  const [filters, setFilters] = useState({ status: "", search: "", page: 1 });

  // 2. LOAD DATA
  const loadData = async () => {
    setLoading(true);
    try {
      const [lRes, rRes, uRes] = await Promise.all([
        LeaseService.list(filters),
        RenterService.list(),
        UnitService.list(),
      ]);

      setData(lRes);
      setRenters(rRes.results || rRes || []);
      setUnits(uRes.results || uRes || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filters.status, filters.page, filters.search]);

  // 3. MAPS & STATS
  const renterMap = useMemo(() => new Map(renters.map(r => [r.id, r])), [renters]);
  const unitMap = useMemo(() => new Map(units.map(u => [u.id, u])), [units]);

  const stats = useMemo(() => ({
    active: data.results.filter((l: any) => l.status === 'active').length,
    draft: data.results.filter((l: any) => l.status === 'draft').length,
    terminated: data.results.filter((l: any) => l.status === 'terminated').length,
    total: data.count
  }), [data]);

  const handleDelete = async (id: number) => {
    if (confirm("⚠️ Confirm Deletion? This will remove all legal and financial history.")) {
      await LeaseService.destroy(id);
      loadData();
    }
  };

  // 4. NAVIGATION OVERRIDE (Lease Dashboard View)
  if (viewingLease) {
    return (
      <LeaseDetails
        lease={viewingLease}
        renter={renterMap.get(viewingLease.renter)}
        unit={unitMap.get(viewingLease.unit)}
        onBack={() => {
          setViewingLease(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="py-4">
      {/* 1. HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Lease Agreements</h2>
          <p className="text-muted mb-0">Manage {data.count} contracts across {data.total_pages} pages.</p>
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

      {/* 2. OVERVIEW CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: "Active", val: stats.active, color: "primary", icon: "bi-check-circle" },
          { label: "Drafts", val: stats.draft, color: "warning", icon: "bi-pencil-square" },
          { label: "Terminated", val: stats.terminated, color: "danger", icon: "bi-x-circle" },
          { label: "Total Records", val: stats.total, color: "info", icon: "bi-archive" }
        ].map((item, i) => (
          <div key={i} className="col-md-3">
            <div className={`card border-0 shadow-sm rounded-4 border-start border-4 border-${item.color} h-100`}>
              <div className="card-body p-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>{item.label}</div>
                  <div className={`h3 fw-bold mb-0 text-${item.color}`}>
                      {Math.max(0, item.val || 0).toString().padStart(2, '0')}
                  </div>
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
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-text text-primary"></i> Contract Records
          </h5>
          <div className="d-flex gap-2">
            <div className="input-group input-group-sm" style={{ maxWidth: '250px' }}>
              <span className="input-group-text bg-light border-0"><i className="bi bi-search"></i></span>
              <input
                 type="text" className="form-control bg-light border-0" placeholder="Search..."
                 value={filters.search} onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
              />
            </div>
            <select
               className="form-select form-select-sm bg-light border-0 w-auto"
               value={filters.status} onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
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
                <tr className="text-muted small text-uppercase fw-bold">
                  <th className="ps-4 py-3 d-none d-md-table-cell">Lease ID</th>
                  <th className="d-none d-md-table-cell">Renter Profile</th>
                  <th className="d-none d-md-table-cell">Unit</th>
                  <th className="text-center d-none d-md-table-cell">Status</th>
                  <th className="d-none d-md-table-cell">Payable</th>
                  <th className="pe-4 text-end d-none d-md-table-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                ) : data.results.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-5 text-muted italic">No lease agreements found.</td></tr>
                ) : data.results.map((l: any) => (
                  <tr key={l.id}>
                    <td className="ps-4 d-none d-md-table-cell">
                      <button className="btn btn-link p-0 text-decoration-none fw-bold text-primary" onClick={() => setViewingLease(l)}>
                        #LS-{l.id.toString().padStart(4, '0')}
                      </button>
                    </td>
                    <td className="d-none d-md-table-cell">
                      <div className="fw-bold text-dark">{renterMap.get(l.renter)?.full_name || `Renter #${l.renter}`}</div>
                      <div className="text-muted x-small">{renterMap.get(l.renter)?.phone_number || "No contact"}</div>
                    </td>
                    <td className="d-none d-md-table-cell"><span className="badge bg-light text-dark border px-3 py-2">{unitMap.get(l.unit)?.name || `Unit #${l.unit}`}</span></td>
                    <td className="text-center d-none d-md-table-cell">
                      <span className={`badge rounded-pill border px-3 py-2 ${l.status === 'active' ? 'bg-success-subtle text-success border-success' : 'bg-warning-subtle text-warning border-warning'}`}>
                        {l.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="fw-bold text-danger d-none d-md-table-cell">৳{Number(l.current_balance || 0).toLocaleString()}</td>
                    <td className="pe-4 text-end d-none d-md-table-cell">
                      <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                        <button className="btn btn-sm px-3 border-end" onClick={() => setViewingLease(l)}><i className="bi bi-speedometer2 text-primary"></i></button>
                        <button className="btn btn-sm px-3" onClick={() => setActiveModal({type: "view", data: l.id})}><i className="bi bi-eye text-primary"></i></button>
                        <button className="btn btn-sm px-3 border-start" onClick={() => setActiveModal({type: "edit", data: l})}><i className="bi bi-pencil-square text-warning"></i></button>
                        <button className="btn btn-sm px-3 border-start" onClick={() => handleDelete(l.id)}><i className="bi bi-trash3 text-danger"></i></button>
                      </div>
                    </td>

                    {/* MOBILE VIEW ROWS */}
                    <td colSpan={6} className="d-md-none p-3">
                       <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                             <button className="btn btn-link p-0 text-decoration-none fw-bold text-primary small" onClick={() => setViewingLease(l)}>
                                #LS-{l.id.toString().padStart(4, '0')}
                             </button>
                             <div className="fw-bold text-dark mt-1" style={{ fontSize: '0.9rem' }}>{renterMap.get(l.renter)?.full_name || "Unknown Renter"}</div>
                          </div>
                          <span className={`badge rounded-pill border px-2 py-1 x-small ${l.status === 'active' ? 'bg-success-subtle text-success border-success' : 'bg-warning-subtle text-warning border-warning'}`}>
                             {l.status?.toUpperCase()}
                          </span>
                       </div>
                       <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>
                             Unit: <span className="text-dark">{unitMap.get(l.unit)?.name || 'N/A'}</span>
                          </div>
                          <div className="fw-bold text-danger small">৳{Number(l.current_balance || 0).toLocaleString()}</div>
                       </div>
                       <div className="d-flex gap-2">
                          <button className="btn btn-light border flex-grow-1 py-2 fw-bold small shadow-sm" onClick={() => setViewingLease(l)}>
                             <i className="bi bi-speedometer2 me-2 text-primary"></i>Dashboard
                          </button>
                          <div className="btn-group shadow-sm border rounded-3 bg-white">
                             <button className="btn btn-sm px-3" onClick={() => setActiveModal({type: "view", data: l.id})}><i className="bi bi-eye text-primary"></i></button>
                             <button className="btn btn-sm px-3 border-start" onClick={() => setActiveModal({type: "edit", data: l})}><i className="bi bi-pencil-square text-warning"></i></button>
                             <button className="btn btn-sm px-3 border-start" onClick={() => handleDelete(l.id)}><i className="bi bi-trash3 text-danger"></i></button>
                          </div>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="d-flex justify-content-between align-items-center bg-light px-4 py-3 border-top">
            <span className="text-muted small">
              Showing Page <b>{data.current_page}</b> of <b>{data.total_pages}</b> (Total: {data.count})
            </span>
            <div className="d-flex gap-2">
              <button
                 className="btn btn-sm btn-white border rounded-pill px-3 shadow-sm fw-bold"
                 disabled={!data.previous}
                 onClick={() => setFilters({...filters, page: filters.page - 1})}
              >
                <i className="bi bi-chevron-left me-1"></i>Prev
              </button>
              <button
                 className="btn btn-sm btn-white border rounded-pill px-3 shadow-sm fw-bold"
                 disabled={!data.next}
                 onClick={() => setFilters({...filters, page: filters.page + 1})}
              >
                Next<i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SYSTEM */}
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
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 overflow-hidden border-0 shadow-lg">
              <div className="modal-header bg-dark text-white p-4">
                <h5 className="modal-title fw-bold">⚙️ Global Configuration</h5>
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