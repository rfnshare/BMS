// components/features/Units/UnitList.tsx
import React from 'react';
import { Unit } from '../../../logic/services/unitService';
import { Floor } from '../../../logic/services/floorService';

interface Props {
  floor?: Floor | null;
  units: Unit[];
  loading: boolean;
  onCreate: (payload: any) => Promise<Unit>;
  onEdit: (id: number, payload: any) => Promise<Unit>;
  onDelete: (id: number) => Promise<boolean>;
  onView: (id: number) => Promise<void>;
}

export default function UnitList({ floor, units, onCreate, onEdit, onDelete, onView }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center bg-success text-white">
        <h5 id="unitsSectionHeader" className="mb-0">{floor ? `Units on ${floor.name}` : 'Select a Floor to View Units'}</h5>
        <button id="addUnitBtn" className="btn btn-light btn-sm" disabled={!floor} onClick={async () => {
          if (!floor) return;
          // quick create dialog
          const unitNumber = prompt('Unit number (e.g. A1)');
          if (!unitNumber) return;
          const unitType = prompt('Unit type (residential/shop)', 'residential') as any;
          await onCreate({ floor: floor.id, name: unitNumber, unit_type: unitType, status: 'vacant' });
        }}>+ Add Unit</button>
      </div>
      <div className="card-body" id="unitsCardBody">
        {!floor && <p id="noUnitsMessage" className="text-center text-muted">No floor selected.</p>}
        {floor && units.length === 0 && <p className="text-center text-muted">No units on this floor.</p>}
        <ul className="list-group list-group-flush" id="unitsList">
          {units.map(u => (
            <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{u.name || u.unit_number || `Unit ${u.id}`}</strong> <span className="badge bg-secondary">{u.unit_type}</span>
                <span className={`badge ms-2 ${u.status === 'vacant' ? 'bg-danger' : 'bg-success'}`}>{u.status}</span>
              </div>
              <div>
                <button className="btn btn-info btn-sm me-1" onClick={() => onView(u.id)}>View</button>
                <button className="btn btn-warning btn-sm me-1" onClick={async () => {
                  const newName = prompt('Unit number/name', u.name || u.unit_number || '');
                  if (!newName) return;
                  await onEdit(u.id, { name: newName });
                }}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={async () => {
                  if (confirm(`Delete unit ${u.name || u.id}?`)) await onDelete(u.id);
                }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
