import { useState } from "react";
import { Floor, FloorService } from "../../../logic/services/floorService";

interface Props {
  floor: Floor | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function FloorModal({ floor, onClose, onSaved }: Props) {
  const [name, setName] = useState(floor?.name || "");
  const [number, setNumber] = useState<number | "">(floor?.number || "");
  const [description, setDescription] = useState(floor?.description || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name || number === "") return;

    setSaving(true);

    const payload = {
      name,
      number: Number(number),
      description: description || null,
    };

    if (floor) {
      await FloorService.update(floor.id, payload);
    } else {
      await FloorService.create(payload);
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {floor ? "Edit Floor" : "Add Floor"}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label>Name</label>
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="mb-3">
              <label>Floor Number</label>
              <input type="number" className="form-control" value={number} onChange={e => setNumber(Number(e.target.value))} />
            </div>

            <div className="mb-3">
              <label>Description</label>
              <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-success" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
