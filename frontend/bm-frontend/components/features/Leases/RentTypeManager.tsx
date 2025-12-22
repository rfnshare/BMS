import { useState } from "react";
import { useRentTypes } from "../../../logic/hooks/useRentTypes";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, Button, Row, Col, InputGroup, Form } from "react-bootstrap";
import RentTypeModal from "./RentTypeModal";

export default function RentTypeManager() {
  const { success, error: notifyError } = useNotify();
  const { items, loading, refresh, handleDelete } = useRentTypes();

  const [editing, setEditing] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const confirmDelete = async (id: number) => {
    if (window.confirm("⚠️ Permanent Delete: Removing this category may impact historical ledger reports. Proceed?")) {
      const res = await handleDelete(id);
      if (res.success) success("Configuration purged from system.");
      else notifyError(res.error || "Deletetion denied by system constraints.");
    }
  };

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. INDUSTRIAL HEADER: Standardized Blueprint Layout */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="text-center text-md-start">
              <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Financial Categories</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Billing & System Ledger Config</p>
            </div>
            <Button
              variant="primary"
              className="rounded-pill px-4 fw-bold shadow-sm py-2 btn-sm w-100 w-md-auto"
              onClick={() => { setEditing(null); setShowModal(true); }}
            >
              <i className="bi bi-plus-lg me-2"></i>ESTABLISH CATEGORY
            </Button>
          </div>
        </div>
      </div>

      {/* 2. LOADING STATE */}
      {loading && items.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted small mt-2 fw-bold ls-1">SYNCING CONFIGURATIONS...</p>
        </div>
      ) : (
        <>
          {/* 3. MOBILE VIEW: ACTION CARDS (Thumb-Friendly) */}
          <div className="d-block d-md-none vstack gap-2 mb-5">
            {items.length === 0 ? (
              <div className="text-center p-5 bg-white rounded-4 border border-dashed">
                <i className="bi bi-folder-x display-6 text-light"></i>
                <p className="small text-muted mt-2">No billing categories defined.</p>
              </div>
            ) : (
              items.map(rt => (
                <div key={rt.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold text-dark mb-1">{rt.name}</div>
                      <code className="bg-light text-primary px-2 py-1 rounded small fw-bold">{rt.code}</code>
                    </div>
                    <Badge pill className={`border x-small px-2 py-1 ${rt.is_active ? 'bg-success-subtle text-success border-success' : 'bg-light text-muted'}`}>
                      {rt.is_active ? "ACTIVE" : "DISABLED"}
                    </Badge>
                  </div>
                  <div className="text-muted x-small mb-3 mt-1 italic">
                    {rt.description || "No supplemental description provided."}
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="light" className="btn-sm border flex-grow-1 fw-bold rounded-pill text-muted small" onClick={() => { setEditing(rt); setShowModal(true); }}>
                      <i className="bi bi-pencil-square me-2 text-warning"></i>MODIFY
                    </Button>
                    <Button variant="light" className="btn-sm border text-danger rounded-pill px-3" onClick={() => confirmDelete(rt.id)}>
                      <i className="bi bi-trash3"></i>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. DESKTOP VIEW: INDUSTRIAL TABLE */}
          <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr className="text-muted x-small fw-bold text-uppercase ls-1">
                  <th className="ps-4 py-3">Category Identity</th>
                  <th className="text-center">System Code</th>
                  <th className="text-center">Status</th>
                  <th className="pe-4 text-end">Management</th>
                </tr>
              </thead>
              <tbody>
                {items.map(rt => (
                  <tr key={rt.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{rt.name}</div>
                      <div className="text-muted x-small fw-bold ls-1">ID REFERENCE: #{rt.id}</div>
                    </td>
                    <td className="text-center">
                      <code className="bg-primary bg-opacity-10 text-primary px-4 py-2 rounded-pill small fw-bold border border-primary border-opacity-10">
                        {rt.code}
                      </code>
                    </td>
                    <td className="text-center">
                        <Badge pill className={`border px-3 py-2 x-small fw-bold ls-1 ${rt.is_active ? 'bg-success-subtle text-success border-success' : 'bg-light text-muted border-light'}`}>
                           {rt.is_active ? "● ACTIVE" : "○ INACTIVE"}
                        </Badge>
                    </td>
                    <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                          <Button variant="white" className="btn-sm px-3 border-end" onClick={() => { setEditing(rt); setShowModal(true); }}>
                            <i className="bi bi-pencil-square text-warning"></i>
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

      {/* 5. MODAL SYSTEM */}
      {showModal && (
        <RentTypeModal
          rentType={editing || undefined}
          onClose={() => { setEditing(null); setShowModal(false); }}
          onSaved={() => {
            setEditing(null);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}