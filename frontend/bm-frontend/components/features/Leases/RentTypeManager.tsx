import { useEffect, useState } from "react";
import { RentType, RentTypeService } from "../../../logic/services/rentTypeService";
import RentTypeModal from "./RentTypeModal";
import { Spinner, Badge, Button } from "react-bootstrap";

export default function RentTypeManager() {
  const [items, setItems] = useState<RentType[]>([]);
  const [editing, setEditing] = useState<RentType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await RentTypeService.list();
      setItems(data.results || data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: number) => {
    if (!confirm("⚠️ Confirm Deletion? This may affect existing leases.")) return;
    await RentTypeService.destroy(id);
    load();
  };

  return (
    /* 🔥 WRAPPER: Ensures a clean centered look on Laptop */
    <div className="mx-auto px-2 px-md-4 py-3" style={{ maxWidth: '950px' }}>

      {/* 1. COMPACT STICKY HEADER */}
      <div
        className="sticky-top bg-white border-bottom shadow-sm mx-n2 mx-md-0 px-3 py-3 mb-4 rounded-bottom-4"
        style={{ zIndex: 1010, top: '70px' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="fw-bold mb-0 text-dark">Rent Categories</h6>
            <small className="text-muted d-none d-sm-block">Define charges like Rent, Water, Gas, etc.</small>
          </div>
          <Button
            variant="primary"
            className="rounded-pill px-4 fw-bold shadow-sm btn-sm"
            onClick={() => setShowModal(true)}
          >
            + <span className="d-none d-sm-inline">Add New</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="animate__animated animate__fadeIn">

          {/* 2. MOBILE ONLY VIEW (Touch-Optimized Cards) */}
          <div className="d-block d-md-none vstack gap-3">
            {items.length === 0 ? (
              <div className="text-center p-5 bg-white border rounded-4 text-muted small">No categories found.</div>
            ) : (
              items.map(rt => (
                <div key={rt.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold text-dark fs-6">{rt.name}</div>
                      <code className="text-primary x-small fw-bold">{rt.code}</code>
                    </div>
                    <Badge bg={rt.is_active ? "success" : "secondary"} className="rounded-pill px-2 py-1 x-small">
                      {rt.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="d-flex gap-2 mt-2 pt-2 border-top">
                    <Button variant="light" className="btn-sm border flex-grow-1 fw-bold text-dark" onClick={() => { setEditing(rt); setShowModal(true); }}>
                      <i className="bi bi-pencil-square me-1"></i> Edit
                    </Button>
                    <Button variant="light" className="btn-sm border text-danger" onClick={() => remove(rt.id)}>
                      <i className="bi bi-trash3"></i>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. LAPTOP ONLY VIEW (Professional Constrained Table) */}
          <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr className="text-muted small fw-bold text-uppercase">
                    <th className="ps-4 py-3">Category Name</th>
                    <th>Code</th>
                    <th className="text-center">Status</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(rt => (
                    <tr key={rt.id}>
                      <td className="ps-4 fw-bold text-dark">{rt.name}</td>
                      <td><code className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded">{rt.code}</code></td>
                      <td className="text-center">
                        <Badge bg={rt.is_active ? "success-subtle" : "secondary-subtle"} className={`text-${rt.is_active ? 'success' : 'secondary'} border`}>
                          {rt.is_active ? "● Active" : "○ Inactive"}
                        </Badge>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="btn-group border rounded-3 bg-white shadow-sm overflow-hidden">
                          <button className="btn btn-sm px-3" onClick={() => { setEditing(rt); setShowModal(true); }}>✏️</button>
                          <button className="btn btn-sm px-3 border-start" onClick={() => remove(rt.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL SYSTEM */}
      {showModal && (
        <RentTypeModal
          rentType={editing || undefined}
          onClose={() => { setEditing(null); setShowModal(false); }}
          onSaved={() => { setEditing(null); setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}