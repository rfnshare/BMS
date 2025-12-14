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
      setFloors(data.results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloors();
  }, []);

  const openCreate = () => {
    setEditingFloor(null);
    setShowModal(true);
  };

  const openEdit = (floor: Floor) => {
    setEditingFloor(floor);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingFloor(null);
    setShowModal(false);
  };

  const onSaved = () => {
    closeModal();
    loadFloors();
  };

  const deleteFloor = async (id: number) => {
    if (!confirm("Delete this floor? All units under this floor will be removed.")) return;
    await FloorService.destroy(id);
    loadFloors();
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Floors</h4>
        <button className="btn btn-primary" onClick={openCreate}>
          Add Floor
        </button>
      </div>

      <table className="table table-bordered align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Number</th>
            <th>Description</th>
            <th width="160">Actions</th>
          </tr>
        </thead>
        <tbody>
          {floors.map((f) => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{f.number}</td>
              <td>{f.description || "-"}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => openEdit(f)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteFloor(f.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {!loading && floors.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                No floors created yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
