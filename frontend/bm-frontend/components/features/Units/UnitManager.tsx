import { useEffect, useState } from "react";
import { Unit, UnitService } from "../../../logic/services/unitService";
import { Floor, FloorService } from "../../../logic/services/floorService";
import UnitModal from "./UnitModal";
import UnitDocumentsModal from "./UnitDocumentsModal";
import UnitDetailsModal from "./UnitDetailsModal";
import { Spinner, Badge } from "react-bootstrap";

export default function UnitManager() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals States
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [docUnit, setDocUnit] = useState<Unit | null>(null);
  const [viewingUnit, setViewingUnit] = useState<Unit | null>(null);

  // Stats
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVacant, setTotalVacant] = useState(0);
  const [totalOccupied, setTotalOccupied] = useState(0);

  const loadData = async (page: number = 1) => {
    setLoading(true);
    try {
      const [unitRes, floorRes] = await Promise.all([
        UnitService.list(page),
        FloorService.list()
      ]);

      setUnits(unitRes.results || []);
      setTotalCount(unitRes.count || 0);
      setTotalPages(unitRes.total_pages || 1);
      setFloors(floorRes.results || floorRes || []);

      const allData = unitRes.results || [];
      setTotalVacant(allData.filter((u: any) => u.status === 'vacant').length);
      setTotalOccupied(allData.filter((u: any) => u.status === 'occupied').length);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(currentPage); }, [currentPage]);

  const handleViewDetails = async (id: number) => {
    setLoading(true);
    try {
      const detail = await UnitService.retrieve(id);
      setViewingUnit(detail);
    } catch (err) {
      alert("Error loading unit details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete unit? This action cannot be undone.")) {
      try {
        await UnitService.destroy(id);
        loadData(currentPage);
      } catch (err) {
        alert("Delete failed. Check for active leases.");
      }
    }
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
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-0">Building Units</h4>
          <p className="text-muted small mb-0">Manage floor-wise property allocation.</p>
        </div>
        <button className="btn btn-primary px-4 rounded-pill shadow-sm fw-bold w-100 w-md-auto" onClick={() => { setEditingUnit(null); setShowModal(true); }}>
          <i className="bi bi-plus-lg me-2"></i>Add Unit
        </button>
      </div>

      {/* STATS ROW (Stacked on Mobile) */}
      <div className="row g-2 mb-4">
        <div className="col-4">
          <div className="card border-0 shadow-sm p-2 p-md-3 bg-white border-start border-4 border-primary rounded-4 text-center text-md-start">
            <small className="text-muted fw-bold x-small d-block">TOTAL</small>
            <h4 className="mb-0 fw-bold">{totalCount}</h4>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm p-2 p-md-3 bg-white border-start border-4 border-success rounded-4 text-center text-md-start">
            <small className="text-muted fw-bold text-success x-small d-block">VACANT</small>
            <h4 className="mb-0 fw-bold text-success">{totalVacant}</h4>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm p-2 p-md-3 bg-white border-start border-4 border-danger rounded-4 text-center text-md-start">
            <small className="text-muted fw-bold text-danger x-small d-block">OCCUPIED</small>
            <h4 className="mb-0 fw-bold text-danger">{totalOccupied}</h4>
          </div>
        </div>
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="d-block d-md-none">
        {loading && !viewingUnit ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
            units.map(u => (
                <div key={u.id} className="card border-0 shadow-sm rounded-4 mb-3 p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 className="fw-bold text-dark mb-0">{u.name}</h5>
                            <small className="text-muted">{floors.find(f => f.id === u.floor)?.name || `Floor ${u.floor}`}</small>
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
            ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
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
              {loading && !viewingUnit ? (
                <tr><td colSpan={6} className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
              ) : (
                units.map((u) => (
                  <tr key={u.id}>
                    <td className="ps-4 fw-bold text-dark">{u.name}</td>
                    <td>{floors.find(f => f.id === u.floor)?.name || `Floor ${u.floor}`}</td>
                    <td className="text-capitalize small">{u.unit_type}</td>
                    <td className="text-center">
                      <span className={`badge border px-3 py-2 rounded-pill ${getStatusBadge(u.status)}`}>{u.status}</span>
                    </td>
                    <td className="fw-bold">৳{Number(u.monthly_rent).toLocaleString()}</td>
                    <td className="pe-4 text-end">
                      <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                        <button className="btn btn-sm btn-white border-end" onClick={() => handleViewDetails(u.id)}><i className="bi bi-eye text-primary"></i></button>
                        <button className="btn btn-sm btn-white border-end" onClick={() => setDocUnit(u)}><i className="bi bi-folder2-open text-info"></i></button>
                        <button className="btn btn-sm btn-white border-end" onClick={() => { setEditingUnit(u); setShowModal(true); }}><i className="bi bi-pencil-square text-warning"></i></button>
                        <button className="btn btn-sm btn-white" onClick={() => handleDelete(u.id)}><i className="bi bi-trash3 text-danger"></i></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border">
          <div className="small text-muted">Page <b>{currentPage}</b> of <b>{totalPages}</b></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {showModal && <UnitModal floors={floors} unit={editingUnit} onClose={() => setShowModal(false)} onSaved={() => loadData(currentPage)} />}
      {docUnit && <UnitDocumentsModal unit={docUnit} onClose={() => setDocUnit(null)} />}
      {viewingUnit && <UnitDetailsModal unit={viewingUnit} onClose={() => setViewingUnit(null)} />}
    </div>
  );
}