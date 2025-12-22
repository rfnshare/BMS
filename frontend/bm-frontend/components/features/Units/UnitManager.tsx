import { useState } from "react";
import { useUnits } from "../../../logic/hooks/useUnits";
import { Spinner } from "react-bootstrap";
import { Unit } from "../../../logic/services/unitService";
import UnitModal from "./UnitModal";
import UnitDocumentsModal from "./UnitDocumentsModal";
import UnitDetailsModal from "./UnitDetailsModal";

export default function UnitManager() {
  const { units, floors, loading, pagination, stats, actions } = useUnits();

  // Local UI State for Modals
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [docUnit, setDocUnit] = useState<Unit | null>(null);
  const [viewingUnit, setViewingUnit] = useState<Unit | null>(null);

  const handleViewDetails = async (id: number) => {
    const detail = await actions.getUnitDetail(id);
    if (detail) setViewingUnit(detail);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      vacant: "bg-success-subtle text-success border-success-subtle",
      occupied: "bg-danger-subtle text-danger border-danger-subtle",
      maintenance: "bg-warning-subtle text-warning border-warning-subtle",
    };
    return map[status] || "bg-light text-dark border";
  };

  return (
    <div className="container-fluid py-3 py-md-4">
      {/* 1. HEADER (Original Design) */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border-start border-4 border-primary">
        <div>
          <h4 className="fw-bold mb-0 text-dark">Units</h4>
          <p className="text-muted x-small mb-0">Manage floor-wise property allocation.</p>
        </div>
        <button className="btn btn-primary px-3 btn-sm fw-bold rounded-pill shadow-sm" onClick={() => { setEditingUnit(null); setShowModal(true); }}>
          <i className="bi bi-plus-lg me-2"></i>Add Unit
        </button>
      </div>

      {/* 2. STATS SECTION (Original Design) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-primary rounded-4">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-bold x-small d-block text-uppercase">Total Units</small>
                <h3 className="mb-0 fw-bold">{pagination.totalCount}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 p-2 rounded-3"><i className="bi bi-building text-primary fs-4"></i></div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-success rounded-4">
            <small className="text-muted fw-bold text-success x-small d-block text-uppercase">Vacant</small>
            <h3 className="mb-0 fw-bold text-success">{stats.vacant}</h3>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-danger rounded-4">
            <small className="text-muted fw-bold text-danger x-small d-block text-uppercase">Occupied</small>
            <h3 className="mb-0 fw-bold text-danger">{stats.occupied}</h3>
          </div>
        </div>
      </div>

      {/* 3. MOBILE & DESKTOP VIEWS (Original Logic) */}
      {loading && units.length === 0 ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <div className="d-block d-md-none">
            {units.map(u => (
               <div key={u.id} className="card border-0 shadow-sm rounded-4 mb-3 p-3">
                 <div className="d-flex justify-content-between align-items-start mb-2">
                   <div>
                     <h5 className="fw-bold text-dark mb-0">{u.name}</h5>
                     <small className="text-muted">{floors.find(f => f.id === (u.floor as any))?.name || `Floor ${u.floor}`}</small>
                   </div>
                   <span className={`badge border rounded-pill px-2 ${getStatusBadge(u.status)}`}>{u.status.toUpperCase()}</span>
                 </div>
                 <div className="d-flex justify-content-between align-items-end">
                   <div>
                     <div className="fw-bold text-primary">৳{Number(u.monthly_rent).toLocaleString()}</div>
                     <div className="x-small text-muted text-capitalize">{u.unit_type}</div>
                   </div>
                   <div className="btn-group">
                     <button className="btn btn-light border btn-sm" onClick={() => handleViewDetails(u.id)}><i className="bi bi-eye text-primary"></i></button>
                     <button className="btn btn-light border btn-sm" onClick={() => setDocUnit(u)}><i className="bi bi-folder2-open text-info"></i></button>
                     <button className="btn btn-light border btn-sm" onClick={() => { setEditingUnit(u); setShowModal(true); }}><i className="bi bi-pencil text-warning"></i></button>
                   </div>
                 </div>
               </div>
            ))}
          </div>

          <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light border-bottom">
                  <tr className="text-muted small text-uppercase">
                    <th className="ps-4 py-3">Unit Name</th>
                    <th>Floor</th>
                    <th>Type</th>
                    <th className="text-center">Status</th>
                    <th>Monthly Rent</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-4 fw-bold text-dark">{u.name}</td>
                      <td>{floors.find(f => f.id === (u.floor as any))?.name || `Floor ${u.floor}`}</td>
                      <td className="text-capitalize small">{u.unit_type}</td>
                      <td className="text-center"><span className={`badge border px-3 py-2 rounded-pill ${getStatusBadge(u.status)}`}>{u.status}</span></td>
                      <td className="fw-bold">৳{Number(u.monthly_rent).toLocaleString()}</td>
                      <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                          <button className="btn btn-sm btn-white border-end" onClick={() => handleViewDetails(u.id)}><i className="bi bi-eye text-primary"></i></button>
                          <button className="btn btn-sm btn-white border-end" onClick={() => setDocUnit(u)}><i className="bi bi-folder2-open text-info"></i></button>
                          <button className="btn btn-sm btn-white border-end" onClick={() => { setEditingUnit(u); setShowModal(true); }}><i className="bi bi-pencil-square text-warning"></i></button>
                          <button className="btn btn-sm btn-white" onClick={() => actions.deleteUnit(u.id)}><i className="bi bi-trash3 text-danger"></i></button>
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

      {/* 4. PAGINATION & MODALS (Original Logic) */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border">
          <div className="small text-muted">Page <b>{pagination.currentPage}</b> of <b>{pagination.totalPages}</b></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={pagination.currentPage === 1} onClick={() => pagination.setCurrentPage(p => p - 1)}>Prev</button>
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={pagination.currentPage === pagination.totalPages} onClick={() => pagination.setCurrentPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {showModal && <UnitModal floors={floors} unit={editingUnit} onClose={() => setShowModal(false)} onSaved={actions.refresh} />}
      {docUnit && <UnitDocumentsModal unit={docUnit} onClose={() => setDocUnit(null)} />}
      {viewingUnit && <UnitDetailsModal unit={viewingUnit} onClose={() => setViewingUnit(null)} />}
    </div>
  );
}