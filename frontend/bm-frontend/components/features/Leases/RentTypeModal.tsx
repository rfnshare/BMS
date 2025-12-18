import { useState } from "react";
import { RentType, RentTypeService } from "../../../logic/services/rentTypeService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  rentType?: RentType;
  onClose: () => void;
  onSaved: () => void;
}

export default function RentTypeModal({ rentType, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: rentType?.name || "",
    code: rentType?.code || "",
    description: rentType?.description || "",
    is_active: rentType?.is_active ?? true,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    setError(null);

    try {
      if (rentType) {
        await RentTypeService.update(rentType.id, form);
      } else {
        await RentTypeService.create(form);
      }
      onSaved();
      onClose(); // Close after success
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">

          {/* HEADER */}
          <div className="modal-header border-bottom-0 pt-4 px-4">
            <h5 className="modal-title fw-bold text-dark">
              {rentType ? "✏️ Edit Rent Category" : "📂 New Rent Category"}
            </h5>
            <button className="btn-close shadow-none" onClick={onClose} />
          </div>

          {/* BODY */}
          <div className="modal-body px-4">
            {error && (
              <div className="alert alert-danger border-0 shadow-sm mb-4 small">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-bold small text-uppercase text-muted">Category Name</label>
              <input
                className="form-control form-control-lg border-2"
                placeholder="e.g., Security Deposit, Service Charge"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-uppercase text-muted">Unique Code</label>
              <input
                className="form-control border-2 font-monospace"
                placeholder="e.g., SD-01, SC-FIXED"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
              />
              <div className="form-text mt-1">Short identifier used for reporting and billing.</div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-uppercase text-muted">Description</label>
              <textarea
                className="form-control border-2"
                rows={3}
                placeholder="Provide details about what this charge covers..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="bg-light p-3 rounded-3 d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-0 fw-bold">Active Status</h6>
                <small className="text-muted">Disable this to hide the category from new leases.</small>
              </div>
              <div className="form-check form-switch fs-4 mb-0">
                <input
                  className="form-check-input cursor-pointer"
                  type="checkbox"
                  role="switch"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-top-0 pb-4 px-4 gap-2">
            <button className="btn btn-link text-decoration-none text-secondary fw-semibold px-3" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-pill"
              onClick={save}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                rentType ? "Update Category" : "Create Category"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}