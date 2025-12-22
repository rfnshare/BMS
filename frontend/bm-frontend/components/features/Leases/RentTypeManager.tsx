import { useState } from "react";
import { useRentTypes } from "../../../logic/hooks/useRentTypes";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Global Notify
import { Spinner, Badge, Button, Row, Col } from "react-bootstrap";
import RentTypeModal from "./RentTypeModal";

export default function RentTypeManager() {
  const { success, error: notifyError } = useNotify(); // ✅ Professional Feedback
  const { items, loading, refresh, handleDelete } = useRentTypes();

  const [editing, setEditing] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const confirmDelete = async (id: number) => {
    if (window.confirm("⚠️ Deleting this category may affect financial history. Continue?")) {
      const res = await handleDelete(id);
      if (res.success) success("Rent category removed successfully.");
      else notifyError(res.error || "Failed to delete.");
    }
  };

  return (
    <div className="animate__animated animate__fadeIn mx-auto" style={{ maxWidth: '1000px' }}>

      {/* 1. HEADER CARD (Blueprint Style) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1 text-dark">Rent Categories</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1">Financial & Billing Configuration</p>
            </div>
            <Button
              className="rounded-pill px-4 fw-bold shadow-sm py-2"
              onClick={() => { setEditing(null); setShowModal(true); }}
            >
              <i className="bi bi-plus-lg me-2"></i>New Category
            </Button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted small mt-2">Loading configurations...</p>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW (Card Style) */}
          <div className="d-block d-md-none vstack gap-2">
            {items.length === 0 ? (
              <div className="text-center p-5 bg-white rounded-4 border border-dashed">No categories found.</div>
            ) : (
              items.map(rt => (
                <div key={rt.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold text-dark">{rt.name}</div>
                      <code className="text-primary x-small fw-bold text-uppercase">{rt.code}</code>
                    </div>
                    <Badge pill className={`border x-small ${rt.is_active ? 'bg-success-subtle text-success border-success' : 'bg-light text-muted'}`}>
                      {rt.is_active ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  <div className="d-flex gap-2 mt-2 pt-2 border-top">
                    <Button variant="light" className="btn-sm border flex-grow-1 fw-bold rounded-pill" onClick={() => { setEditing(rt); setShowModal(true); }}>
                      <i className="bi bi-pencil-square me-1"></i> Edit
                    </Button>
                    <Button variant="light" className="btn-sm border text-danger rounded-pill px-3" onClick={() => confirmDelete(rt.id)}>
                      <i className="bi bi-trash3"></i>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP VIEW (Professional Table) */}
          <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr className="text-muted x-small fw-bold text-uppercase">
                  <th className="ps-4 py-3 ls-1">Category Detail</th>
                  <th className="ls-1 text-center">System Code</th>
                  <th className="ls-1 text-center">Status</th>
                  <th className="pe-4 text-end ls-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(rt => (
                  <tr key={rt.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark small">{rt.name}</div>
                      <div className="x-small text-muted">ID: {rt.id}</div>
                    </td>
                    <td className="text-center">
                      <code className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill small fw-bold">
                        {rt.code}
                      </code>
                    </td>
                    <td className="text-center">
                        <Badge pill className={`border x-small px-3 py-2 ${rt.is_active ? 'bg-success-subtle text-success border-success' : 'bg-light text-muted'}`}>
                           {rt.is_active ? "● ACTIVE" : "○ INACTIVE"}
                        </Badge>
                    </td>
                    <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                          <Button variant="white" className="btn-sm px-3 border-end" onClick={() => { setEditing(rt); setShowModal(true); }}>
                            <i className="bi bi-pencil-square text-primary"></i>
                          </Button>
                          <Button variant="white" className="btn-sm px-3 text-danger" onClick={() => confirmDelete(rt.id)}>
                            <i className="bi bi-trash3"></i>
                          </Button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL SYSTEM */}
      {showModal && (
        <RentTypeModal
          rentType={editing || undefined}
          onClose={() => { setEditing(null); setShowModal(false); }}
          onSaved={() => {
            success(editing ? "Category updated." : "New rent category added.");
            setEditing(null);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}