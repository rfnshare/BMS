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
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5>{rentType ? "Edit Rent Type" : "Add Rent Type"}</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <label>Name</label>
            <input className="form-control mb-2"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <label>Code</label>
            <input className="form-control mb-2"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })}
            />

            <label>Description</label>
            <textarea className="form-control mb-2"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />

            <div className="form-check">
              <input type="checkbox" className="form-check-input"
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
              />
              <label className="form-check-label">Active</label>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-success" onClick={save} disabled={loading}>
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
