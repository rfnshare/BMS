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

  // ========================
  // 1. Data Loading Logic
  // ========================
  const loadData = async () => {
    setLoading(true);
    try {
      const [unitRes, floorRes] = await Promise.all([
        UnitService.list(),
        FloorService.list()
      ]);
      // Handle both paginated results and direct arrays
      setUnits(unitRes.results || unitRes || []);
      setFloors(floorRes.results || floorRes || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ========================
  // 2. Action Handlers
  // ========================
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this unit? This action cannot be undone.")) {
      try {
        await UnitService.destroy(id);
        loadData(); // Refresh list
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
            <h3 className="mb-0 fw-bold">{units.length}</h3>
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
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
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
                    <td className="pe-4 text-end">
                      <div className="btn-group shadow-sm border rounded-3 overflow-hidden">
                        {/* Documents */}
                        <button
                          className="btn btn-sm btn-white border-end"
                          onClick={() => setDocUnit(u)}
                          title="Documents"
                        >
                          <i className="bi bi-folder2-open text-info"></i>
                        </button>

                        {/* Edit */}
                        <button
                          className="btn btn-sm btn-white border-end"
                          onClick={() => { setEditingUnit(u); setShowModal(true); }}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square text-warning"></i>
                        </button>

                        {/* Delete */}
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

      {/* MODALS */}
      {showModal && (
        <UnitModal
          floors={floors}
          unit={editingUnit}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
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