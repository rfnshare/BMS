// components/features/Units/UnitDetails.tsx
import React, { useRef } from 'react';
import { Unit, UnitDocument } from '../../../logic/services/unitService';

interface Props {
  unit?: Unit | null;
  loading: boolean;
  onUpload: (unitId: number, fd: FormData) => Promise<any>;
  onDeleteDocument: (unitId: number, docId: number) => Promise<boolean>;
}

export default function UnitDetails({ unit, loading, onUpload, onDeleteDocument }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    if (!unit || !fileRef.current?.files?.length) return;
    const f = fileRef.current.files[0];
    const fd = new FormData();
    fd.append('file', f);
    fd.append('doc_type', 'other');
    await onUpload(unit.id, fd);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (!unit) return null;

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-secondary text-white">
        <h5 className="mb-0">Unit {unit.name || unit.unit_number || unit.id} Details</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <strong>Floor:</strong> {unit.floor}<br />
            <strong>Type:</strong> {unit.unit_type}<br />
            <strong>Status:</strong> {unit.status}<br />
            <strong>Rent:</strong> {unit.monthly_rent || 'N/A'}<br />
            <strong>Deposit:</strong> {unit.security_deposit || 'N/A'}<br />
          </div>
          <div className="col-md-6">
            <strong>Documents:</strong>
            <ul className="list-group mt-2">
              {(unit.documents || []).map((d: UnitDocument) => (
                <li key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <a href={d.file} target="_blank" rel="noreferrer">{d.doc_type} #{d.id}</a>
                  <button className="btn btn-sm btn-danger" onClick={() => {
                    if (confirm('Delete this document?')) onDeleteDocument(unit.id, d.id);
                  }}>Delete</button>
                </li>
              ))}
              {!(unit.documents || []).length && <li className="list-group-item text-muted">No documents</li>}
            </ul>
            <div className="mt-3">
              <input type="file" ref={fileRef} className="form-control mb-2" />
              <button className="btn btn-outline-primary btn-sm" onClick={handleUpload} disabled={loading}>Upload Document</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
