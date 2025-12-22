import { useState } from "react";
import { Floor } from "../../../logic/services/floorService";
import { useFloors } from "../../../logic/hooks/useFloors";
import FloorModal from "./FloorModal";
import { Spinner } from "react-bootstrap";

export default function FloorManager() {
    const { floors, loading, refresh, deleteFloor } = useFloors();
    const [showModal, setShowModal] = useState(false);
    const [editingFloor, setEditingFloor] = useState<Floor | null>(null);

    // Standardized Handlers
    const openCreate = () => { setEditingFloor(null); setShowModal(true); };
    const openEdit = (floor: Floor) => { setEditingFloor(floor); setShowModal(true); };
    const onSaved = () => { setShowModal(false); refresh(); };

    return (
        <div className="animate__animated animate__fadeIn">
            {/* 1. SMALL SUB-HEADER (Matches Unit Style) */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                        <i className="bi bi-layers-fill fs-5"></i>
                    </div>
                    <h5 className="fw-bold mb-0 text-dark">Floor Configuration</h5>
                </div>
                <button className="btn btn-primary px-3 btn-sm fw-bold rounded-pill shadow-sm" onClick={openCreate}>
                    <i className="bi bi-plus-lg me-2"></i>Add Floor
                </button>
            </div>

            {/* 2. DATA VIEW (Table to match Units) */}
            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>
            ) : (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light border-bottom">
                                <tr className="text-muted small text-uppercase fw-bold">
                                    <th className="ps-4 py-3" style={{ width: '80px' }}>Level</th>
                                    <th>Floor Name</th>
                                    <th>Description</th>
                                    <th className="pe-4 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {floors.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-5 text-muted">No floors defined.</td></tr>
                                ) : (
                                    floors.map((f) => (
                                        <tr key={f.id}>
                                            <td className="ps-4">
                                                <div className="bg-light rounded-circle fw-bold d-flex align-items-center justify-content-center text-primary border small"
                                                     style={{ width: '35px', height: '35px' }}>
                                                    {f.number}
                                                </div>
                                            </td>
                                            <td className="fw-bold text-dark">{f.name}</td>
                                            <td className="text-muted small">{f.description || "No description."}</td>
                                            <td className="pe-4 text-end">
                                                <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                                                    <button className="btn btn-sm btn-white border-end" onClick={() => openEdit(f)}>
                                                        <i className="bi bi-pencil text-warning"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-white text-danger" onClick={() => deleteFloor(f.id)}>
                                                        <i className="bi bi-trash3"></i>
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
            )}

            {showModal && <FloorModal floor={editingFloor} onClose={() => setShowModal(false)} onSaved={onSaved} />}
        </div>
    );
}