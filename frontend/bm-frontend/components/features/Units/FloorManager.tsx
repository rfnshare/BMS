import { useState } from "react";
import { Floor } from "../../../logic/services/floorService";
import { useFloors } from "../../../logic/hooks/useFloors";
import FloorModal from "./FloorModal";
import { Spinner, Badge, Button, Row, Col, InputGroup, Form } from "react-bootstrap";

export default function FloorManager() {
    const { floors, loading, refresh, deleteFloor } = useFloors();
    const [showModal, setShowModal] = useState(false);
    const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Standardized Handlers
    const openCreate = () => { setEditingFloor(null); setShowModal(true); };
    const openEdit = (floor: Floor) => { setEditingFloor(floor); setShowModal(true); };
    const onSaved = () => { setShowModal(false); refresh(); };

    // Filter Logic for Consistency
    const filteredFloors = floors.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.number.toString().includes(searchTerm)
    );

    return (
        <div className="animate__animated animate__fadeIn">

            {/* 1. ASSET KPI CARDS (Matching Unit Style) */}
            <Row className="g-2 g-md-3 mb-4">
                <Col xs={12} md={4}>
                    <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-primary bg-white h-100">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-muted fw-bold text-uppercase ls-1 d-block" style={{ fontSize: '0.6rem' }}>Total Levels</small>
                                <h3 className="fw-bold mb-0 text-primary">{floors.length.toString().padStart(2, '0')}</h3>
                            </div>
                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                                <i className="bi bi-layers fs-4"></i>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* 2. FILTER & ACTION BAR (Pill Style) */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white border">
                <Row className="g-2">
                    <Col xs={12} md={8}>
                        <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                            <InputGroup.Text className="bg-light border-0 ps-3">
                                <i className="bi bi-search text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control
                                className="bg-light border-0 py-2 shadow-none fw-medium"
                                placeholder="Search floors by name or level..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col xs={12} md={4}>
                        <Button
                            variant="primary"
                            className="w-100 rounded-pill fw-bold shadow-sm py-2 btn-sm"
                            onClick={openCreate}
                        >
                            <i className="bi bi-plus-lg me-1"></i> ADD LEVEL
                        </Button>
                    </Col>
                </Row>
            </div>

            {loading && floors.length === 0 ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : (
                <>
                    {/* 3. DESKTOP VIEW (TABLE) */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white d-none d-md-block mb-3">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light border-bottom">
                                <tr className="text-muted x-small fw-bold text-uppercase ls-1">
                                    <th className="ps-4 py-3" style={{ width: '100px' }}>Level</th>
                                    <th>Floor Identity</th>
                                    <th>Asset Description</th>
                                    <th className="pe-4 text-end">Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFloors.map((f) => (
                                    <tr key={f.id}>
                                        <td className="ps-4">
                                            <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '35px', height: '35px' }}>
                                                {f.number}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{f.name}</div>
                                            <div className="text-muted x-small fw-bold ls-1">ID: #{f.id}</div>
                                        </td>
                                        <td className="text-muted small">
                                            {f.description || <span className="opacity-25 italic">No additional notes.</span>}
                                        </td>
                                        <td className="pe-4 text-end">
                                            <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                                                <button className="btn btn-sm btn-white px-3 border-end" onClick={() => openEdit(f)}>
                                                    <i className="bi bi-pencil-square text-warning"></i>
                                                </button>
                                                <button className="btn btn-sm btn-white px-3 text-danger" onClick={() => deleteFloor(f.id)}>
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 4. MOBILE VIEW (CARDS) - Matching Units */}
                    <div className="d-block d-md-none vstack gap-2 mb-4">
                        {filteredFloors.map((f) => (
                            <div key={f.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 fw-bold">
                                        LEVEL {f.number}
                                    </Badge>
                                    <div className="btn-group border rounded-pill bg-white shadow-sm overflow-hidden">
                                        <button className="btn btn-sm btn-white text-warning px-3" onClick={() => openEdit(f)}>
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                        <button className="btn btn-sm btn-white text-danger px-3" onClick={() => deleteFloor(f.id)}>
                                            <i className="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="fw-bold text-dark mb-1">{f.name}</div>
                                <div className="text-muted x-small italic">{f.description || "No description provided."}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* MODAL CONNECTION */}
            {showModal && <FloorModal floor={editingFloor} onClose={() => setShowModal(false)} onSaved={onSaved} />}
        </div>
    );
}