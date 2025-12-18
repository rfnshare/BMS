import { useEffect, useState } from "react";
import { Floor, FloorService } from "../../../logic/services/floorService";
import FloorModal from "./FloorModal";

export default function FloorManager() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFloors = async () => {
    setLoading(true);
    try {
      const data = await FloorService.list();
      setFloors(data.results || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFloors(); }, []);

  const openCreate = () => { setEditingFloor(null); setShowModal(true); };
  const openEdit = (floor: Floor) => { setEditingFloor(floor); setShowModal(true); };
  const closeModal = () => { setEditingFloor(null); setShowModal(false); };

  const onSaved = () => {
    closeModal();
    loadFloors();
  };

  const deleteFloor = async (id: number) => {
    if (!confirm("Are you sure? This might affect units assigned to this floor.")) return;
    try {
      await FloorService.destroy(id);
      loadFloors();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Unable to delete floor.");
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border-start border-4 border-primary">
        <div>
          <h4 className="fw-bold mb-0 text-dark">Building Floors</h4>
          <p className="text-muted small mb-0">Define the vertical structure of your building.</p>
        </div>
        <button className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm" onClick={openCreate}>
          + Add New Floor
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Floor Identity</th>
                <th className="py-3 text-center">Floor Level</th>
                <th className="py-3">Description</th>
                <th className="pe-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
              ) : floors.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-5 text-muted">No floors found. Add one to get started.</td></tr>
              ) : (
                floors.map((f) => (
                  <tr key={f.id} className="transition-all">
                    <td className="ps-4 fw-bold text-dark">{f.name}</td>
                    <td className="text-center">
                      <span className="badge rounded-circle bg-primary-subtle text-primary border border-primary-subtle" style={{ width: '35px', height: '35px', lineHeight: '25px' }}>
                        {f.number}
                      </span>
                    </td>
                    <td className="text-muted small">{f.description || "No description provided."}</td>
                    <td className="pe-4 text-end">
                      <div className="btn-group shadow-sm rounded-3 overflow-hidden">
                        <button className="btn btn-sm btn-white border-end" title="Edit" onClick={() => openEdit(f)}>✏️</button>
                        <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => deleteFloor(f.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <FloorModal floor={editingFloor} onClose={closeModal} onSaved={onSaved} />
      )}
    </div>
  );
}