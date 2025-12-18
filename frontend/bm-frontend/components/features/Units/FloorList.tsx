// components/features/Units/FloorList.tsx
import React, { useState } from 'react';
import { Floor } from '../../../logic/services/floorService';

interface Props {
  floors: Floor[];
  loading: boolean;
  selectedFloor?: Floor | null;
  onSelect: (f: Floor) => void;
  onCreate: (payload: Partial<Floor>) => Promise<Floor>;
  onUpdate: (id: number, payload: Partial<Floor>) => Promise<Floor>;
  onDelete: (id: number) => Promise<boolean>;
}

export default function FloorList({ floors, selectedFloor, onSelect, onCreate, onUpdate, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) return;
    await onCreate({ name, description: desc, number: 0 });
    setName(''); setDesc(''); setShowAdd(false);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
        <h5 className="mb-0">Current Floors</h5>
        <button className="btn btn-light btn-sm" onClick={() => setShowAdd(v => !v)}>
          + Add Floor
        </button>
      </div>
      <div className="card-body p-0">
        {showAdd && (
          <div className="p-3 border-bottom">
            <input className="form-control mb-2" placeholder="Floor name" value={name} onChange={e => setName(e.target.value)} />
            <input className="form-control mb-2" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Save</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}
        <ul className="list-group list-group-flush">
          {floors.length === 0 && <li className="list-group-item text-center text-muted">No floors found.</li>}
          {floors.map(f => (
            <li key={f.id} className={`list-group-item d-flex justify-content-between align-items-center ${selectedFloor?.id === f.id ? 'active text-white' : ''}`}>
              <div style={{ cursor: 'pointer' }} onClick={() => onSelect(f)}>{f.name}</div>
              <div>
                <button className="btn btn-info btn-sm me-1" onClick={() => onSelect(f)}>View Units</button>
                <button className="btn btn-warning btn-sm me-1" onClick={async () => {
                  const newName = prompt('Floor name', f.name) || f.name;
                  const desc = prompt('Description', f.description || '') || '';
                  await onUpdate(f.id, { name: newName, description: desc });
                }}>Edit</button>
                <button
  className="btn btn-danger btn-sm"
  onClick={async () => {
    if (!confirm(`Delete floor ${f.name}?`)) return;

    try {
      await onDelete(f.id);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Unable to delete floor.";
      alert(msg);
    }
  }}
>
  Delete
</button>

              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
