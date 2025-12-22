import { useState } from "react";
import { Floor } from "../../../logic/services/floorService";
import { useFloors } from "../../../logic/hooks/useFloors"; // Import the new hook
import FloorModal from "./FloorModal";
import { Spinner } from "react-bootstrap";

export default function FloorManager() {
  // 1. Logic handled by the custom hook
  const { floors, loading, refresh, deleteFloor } = useFloors();

  // 2. UI-specific state for Modals
  const [showModal, setShowModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);

  // UI Handlers
  const openCreate = () => { setEditingFloor(null); setShowModal(true); };
  const openEdit = (floor: Floor) => { setEditingFloor(floor); setShowModal(true); };
  const closeModal = () => { setEditingFloor(null); setShowModal(false); };

  const onSaved = () => {
    closeModal();
    refresh(); // Refresh list using hook action
  };

  const handleDelete = async (id: number) => {
    const result = await deleteFloor(id);
    if (result?.error) alert(result.error);
  };

  return (
    <div className="container-fluid py-3 py-md-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border-start border-4 border-primary">
        <div>
          <h4 className="fw-bold mb-0 text-dark">Floors</h4>
          <p className="text-muted x-small mb-0">Manage building levels.</p>
        </div>
        <button className="btn btn-primary px-3 btn-sm fw-bold rounded-pill shadow-sm" onClick={openCreate}>
          + Add Floor
        </button>
      </div>

      {/* LIST SECTION */}
      <div className="vstack gap-2">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : floors.length === 0 ? (
          <div className="text-center py-5 text-muted small">No floors defined.</div>
        ) : (
          floors.map((f) => (
            <div key={f.id} className="card border-0 shadow-sm rounded-4 p-3 d-flex flex-row align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="bg-light rounded-circle fw-bold d-flex align-items-center justify-content-center text-primary border"
                  style={{ width: '40px', height: '40px' }}
                >
                  {f.number}
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">{f.name}</h6>
                  <small className="text-muted x-small">{f.description || "No description."}</small>
                </div>
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-sm btn-light border rounded-pill me-1"
                  onClick={() => openEdit(f)}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-sm btn-light border rounded-pill text-danger"
                  onClick={() => handleDelete(f.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <FloorModal
          floor={editingFloor}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}