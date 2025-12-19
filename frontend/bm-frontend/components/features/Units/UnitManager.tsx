import { useEffect, useState } from "react";
import { Unit, UnitService } from "../../../logic/services/unitService";
import { Floor, FloorService } from "../../../logic/services/floorService";
import UnitModal from "./UnitModal";
import UnitDocumentsModal from "./UnitDocumentsModal";

export default function UnitManager() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [docUnit, setDocUnit] = useState<Unit | null>(null);

  // 🔥 NEW: Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ========================
  // 1. Data Loading Logic
  // ========================
  const loadData = async (page: number = 1) => {
    setLoading(true);
    try {
      // Assuming UnitService.list(page) now accepts a page number
      const [unitRes, floorRes] = await Promise.all([
        UnitService.list(page),
        FloorService.list()
      ]);

      // 🔥 Updated to handle Paginated MetaData
      setUnits(unitRes.results || unitRes || []);
      setTotalCount(unitRes.count || (unitRes.results ? unitRes.results.length : 0));
      setTotalPages(unitRes.total_pages || 1);

      setFloors(floorRes.results || floorRes || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Reload when page changes
  useEffect(() => { loadData(currentPage); }, [currentPage]);

  // ========================
  // 2. Action Handlers
  // ========================
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this unit? This action cannot be undone.")) {
      try {
        await UnitService.destroy(id);
        loadData(currentPage); // Refresh current page
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Could not delete. The unit might be linked to an active lease.");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      vacant: "bg-success-subtle text-success border-success-subtle",
      occupied: "bg-danger-subtle text-danger border-danger-subtle",
      maintenance: "bg-warning-subtle text-warning border-warning-subtle",
    };
    return map[status] || "bg-secondary-subtle text-secondary border-secondary-subtle";
  };

  return (
    <div className="container-fluid py-2 animate__animated animate__fadeIn">

      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-0">Building Units</h4>
          <p className="text-muted small mb-0">Manage floor-wise property allocation.</p>
        </div>
        <button
          className="btn btn-primary px-4 rounded-pill shadow-sm fw-bold"
          onClick={() => { setEditingUnit(null); setShowModal(true); }}
        >
          <i className="bi bi-plus-lg me-2"></i>Add New Unit
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-primary">
            <small className="text-muted fw-bold">TOTAL UNITS</small>
            {/* 🔥 Updated: Shows total count from DB, not just the list length */}
            <h3 className="mb-0 fw-bold">{totalCount}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-success">
            <small className="text-muted fw-bold text-uppercase text-success">Vacant / Available</small>
            <h3 className="mb-0 fw-bold text-success">
              {units.filter(u => u.status === 'vacant').length}
            </h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-danger">
            <small className="text-muted fw-bold text-uppercase text-danger">Occupied</small>
            <h3 className="mb-0 fw-bold text-danger">
              {units.filter(u => u.status === 'occupied').length}
            </h3>
          </div>
        </div>
      </div>

      {/* DATA TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">No units found.</td>
                </tr>
              ) : (
                units.map((u) => (
                  <tr key={u.id}>
                    <td className="ps-4 fw-bold text-dark">{u.name}</td>
                    <td>
                      <span className="text-muted small d-flex align-items-center gap-1">
                        <i className="bi bi-layers text-primary"></i>
                        {floors.find(f => f.id === u.floor)?.name || "N/A"}
                      </span>
                    </td>
                    <td className="text-capitalize small">{u.unit_type}</td>
                    <td className="text-center">
                      <span className={`badge border px-3 py-2 rounded-pill fw-medium ${getStatusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="fw-bold">
                      ৳{u.monthly_rent ? Number(u.monthly_rent).toLocaleString() : "0"}
                    </td>
                    {/* EXISTING ACTION BUTTONS PRESERVED */}
                    <td className="pe-4 text-end">
                      <div className="btn-group shadow-sm border rounded-3 overflow-hidden">
                        <button
                          className="btn btn-sm btn-white border-end"
                          onClick={() => setDocUnit(u)}
                          title="Documents"
                        >
                          <i className="bi bi-folder2-open text-info"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-white border-end"
                          onClick={() => { setEditingUnit(u); setShowModal(true); }}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square text-warning"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-white"
                          onClick={() => handleDelete(u.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash3 text-danger"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 NEW: PAGINATION UI */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border">
          <div className="small text-muted">
            Showing <b>{units.length}</b> units on page <b>{currentPage}</b>
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0 gap-1">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link border-0 rounded-3 shadow-sm" onClick={() => setCurrentPage(prev => prev - 1)}>
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>

              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link border-0 rounded-3 shadow-sm" onClick={() => setCurrentPage(prev => prev + 1)}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* MODALS */}
      {showModal && (
        <UnitModal
          floors={floors}
          unit={editingUnit}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(currentPage); }}
        />
      )}

      {docUnit && (
        <UnitDocumentsModal
          unit={docUnit}
          onClose={() => setDocUnit(null)}
        />
      )}
    </div>
  );
}