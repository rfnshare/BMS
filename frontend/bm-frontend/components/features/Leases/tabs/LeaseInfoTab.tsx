import { useEffect, useState } from "react";
import api from "../../../../logic/services/apiClient";

export default function LeaseInfoTab({ form, update }: any) {
  const [renters, setRenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    // Parallel fetching for performance
    Promise.all([
      api.get("/renters/?status=active"),
      api.get("/buildings/units/?status=vacant")
    ]).then(([r, u]) => {
      setRenters(r.data.results || r.data);
      setUnits(u.data.results || u.data);
    });
  }, []);

  return (
    <div className="row g-4 animate__animated animate__fadeIn">
      {/* RENTER SELECTION */}
      <div className="col-md-6">
        <label className="form-label small fw-bold text-muted text-uppercase">
          <i className="bi bi-person-check me-2"></i>Renter *
        </label>
        <select
          className="form-select border-0 bg-light p-3 rounded-4 shadow-sm"
          value={form.renter}
          onChange={e => update("renter", Number(e.target.value))}
        >
          <option value="">Choose an active renter...</option>
          {renters.map(r => (
            <option key={r.id} value={r.id}>{r.full_name} ({r.phone_number})</option>
          ))}
        </select>
      </div>

      {/* UNIT SELECTION */}
      <div className="col-md-6">
        <label className="form-label small fw-bold text-muted text-uppercase">
          <i className="bi bi-building me-2"></i>Target Unit *
        </label>
        <select
          className="form-select border-0 bg-light p-3 rounded-4 shadow-sm"
          value={form.unit}
          onChange={e => update("unit", Number(e.target.value))}
        >
          <option value="">Select a vacant unit...</option>
          {units.map(u => (
            <option key={u.id} value={u.id}>{u.name} — Floor {u.floor_name}</option>
          ))}
        </select>
      </div>

      {/* DATES & STATUS */}
      <div className="col-md-6">
        <label className="form-label small fw-bold text-muted text-uppercase">Start Date</label>
        <input
          type="date"
          className="form-control border-0 bg-light p-3 rounded-4 shadow-sm"
          value={form.start_date}
          onChange={e => update("start_date", e.target.value)}
        />
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-bold text-muted text-uppercase">Initial Status</label>
        <select
          className="form-select border-0 bg-light p-3 rounded-4 shadow-sm"
          value={form.status}
          onChange={e => update("status", e.target.value)}
        >
          <option value="active">Active (Immediate)</option>
          <option value="draft">Draft (Stay in preparation)</option>
        </select>
      </div>
    </div>
  );
}