import { useEffect, useState } from "react";
import { RentType, RentTypeService } from "../../../logic/services/rentTypeService";
import RentTypeModal from "./RentTypeModal";

export default function RentTypeManager() {
  const [items, setItems] = useState<RentType[]>([]);
  const [editing, setEditing] = useState<RentType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await RentTypeService.list();
      setItems(data.results || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rent type? This may affect existing leases.")) return;
    await RentTypeService.destroy(id);
    load();
  };

  return (
    <div className="p-3">
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 mb-4 shadow-sm border">
        <div>
          <h6 className="fw-bold mb-0 text-dark">Rent Categories</h6>
          <small className="text-muted">Define charges like Rent, Water, Gas, etc.</small>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => setShowModal(true)}>
          <span className="me-1">+</span> Add New
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="table-responsive rounded-3 border bg-white">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="ps-4 py-3 border-0 small fw-bold text-muted text-uppercase">Name</th>
              <th className="py-3 border-0 small fw-bold text-muted text-uppercase">Unique Code</th>
              <th className="py-3 border-0 small fw-bold text-muted text-uppercase text-center">Status</th>
              <th className="pe-4 py-3 border-0 small fw-bold text-muted text-uppercase text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="border-top-0">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  <span className="text-muted">Loading categories...</span>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-5 text-muted italic">
                  No rent categories found. Create one to get started.
                </td>
              </tr>
            ) : (
              items.map(rt => (
                <tr key={rt.id}>
                  <td className="ps-4 fw-bold text-dark">{rt.name}</td>
                  <td><code className="bg-light px-2 py-1 rounded text-primary small">{rt.code}</code></td>
                  <td className="text-center">
                    <span className={`badge rounded-pill px-3 py-2 border ${
                      rt.is_active
                        ? "bg-success-subtle text-success border-success"
                        : "bg-secondary-subtle text-secondary border-secondary"
                    }`}>
                      {rt.is_active ? "● Active" : "○ Inactive"}
                    </span>
                  </td>
                  <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm">
                      <button
                        className="btn btn-sm btn-white border"
                        title="Edit"
                        onClick={() => { setEditing(rt); setShowModal(true); }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger border"
                        title="Delete"
                        onClick={() => remove(rt.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
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