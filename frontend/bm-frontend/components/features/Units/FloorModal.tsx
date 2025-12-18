import { useState } from "react";
import { Floor, FloorService } from "../../../logic/services/floorService";

interface Props {
  floor: Floor | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function FloorModal({ floor, onClose, onSaved }: Props) {
  const [name, setName] = useState(floor?.name || "");
  const [number, setNumber] = useState<number | "">(floor?.number ?? "");
  const [description, setDescription] = useState(floor?.description || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name || number === "") return;
    setSaving(true);
    const payload = { name, number: Number(number), description: description || null };

    try {
      floor ? await FloorService.update(floor.id, payload) : await FloorService.create(payload);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(5px)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">

          <div className="modal-header border-0 pt-4 px-4">
            <h5 className="modal-title fw-bold text-dark">
              {floor ? "✏️ Edit Floor Details" : "🏢 Add New Floor"}
            </h5>
            <button className="btn-close shadow-none" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label fw-bold small text-muted text-uppercase">Floor Name</label>
                <input
                  className="form-control border-2 bg-light shadow-none"
                  placeholder="e.g. Ground Floor, Level 1"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold small text-muted text-uppercase">Number</label>
                <input
                  type="number"
                  className="form-control border-2 bg-light shadow-none"
                  placeholder="0"
                  value={number}
                  onChange={e => setNumber(Number(e.target.value))}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold small text-muted text-uppercase">Description</label>
                <textarea
                  className="form-control border-2 bg-light shadow-none"
                  rows={3}
                  placeholder="Add any specific notes about this floor..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer border-0 pb-4 px-4 gap-2">
            <button className="btn btn-link text-decoration-none text-secondary fw-semibold" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-pill" onClick={save} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {floor ? "Update Floor" : "Create Floor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}