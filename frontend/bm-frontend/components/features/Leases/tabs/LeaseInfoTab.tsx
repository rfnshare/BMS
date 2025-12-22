import { useEffect, useState } from "react";
import api from "../../../../logic/services/apiClient";

// 1. Add 'isEdit' to the props
export default function LeaseInfoTab({ form, update, isEdit }: any) {
  const [renters, setRenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    // If we are editing, we shouldn't strictly filter for 'vacant'
    // because the current unit is technically 'occupied' by this lease.
    const unitFilter = isEdit ? "" : "?status=vacant";
    const renterFilter = isEdit ? "" : "?status=active";

    Promise.all([
      api.get(`/renters/${renterFilter}`),
      api.get(`/buildings/units/${unitFilter}`)
    ]).then(([r, u]) => {
      setRenters(r.data.results || r.data);
      setUnits(u.data.results || u.data);
    });
  }, [isEdit]); // Re-run if edit mode changes

  return (
    <div className="row g-3 animate__animated animate__fadeIn">
      {/* RENTER SELECTION */}
      <div className="col-12 col-md-6">
        <label className="form-label small fw-bold text-muted text-uppercase">
          <i className="bi bi-person-check me-2"></i>Renter *
        </label>
        <select
          // 2. Add 'disabled' attribute
          disabled={isEdit}
          // 3. Conditional styling for disabled state
          className={`form-select border-0 py-3 rounded-4 shadow-sm ${
            isEdit ? "bg-secondary bg-opacity-10 text-muted" : "bg-light"
          }`}
          value={form.renter}
          onChange={(e) => update("renter", Number(e.target.value))}
        >
          <option value="">Choose a renter...</option>
          {renters.map((r) => (
            <option key={r.id} value={r.id}>
              {r.full_name} ({r.phone_number})
            </option>
          ))}
        </select>
        {isEdit && <div className="x-small text-muted mt-1 ms-2">Locked for established agreements</div>}
      </div>

      {/* UNIT SELECTION */}
      <div className="col-12 col-md-6">
        <label className="form-label small fw-bold text-muted text-uppercase">
          <i className="bi bi-building me-2"></i>Target Unit *
        </label>
        <select
          disabled={isEdit}
          className={`form-select border-0 py-3 rounded-4 shadow-sm ${
            isEdit ? "bg-secondary bg-opacity-10 text-muted" : "bg-light"
          }`}
          value={form.unit}
          onChange={(e) => update("unit", Number(e.target.value))}
        >
          <option value="">Select a unit...</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — Floor {u.floor_name}
            </option>
          ))}
        </select>
        {isEdit && <div className="x-small text-muted mt-1 ms-2">Unit cannot be changed on existing lease</div>}
      </div>

      {/* DATES & STATUS */}
      <div className="col-12 col-md-6">
        <label className="form-label small fw-bold text-muted text-uppercase">Start Date</label>
        <input
          type="date"
          className="form-control border-0 bg-light py-3 rounded-4 shadow-sm"
          value={form.start_date}
          onChange={(e) => update("start_date", e.target.value)}
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label small fw-bold text-muted text-uppercase">Initial Status</label>
        <select
          className="form-select border-0 bg-light py-3 rounded-4 shadow-sm"
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="active">Active (Immediate)</option>
          <option value="draft">Draft (Stay in preparation)</option>
        </select>
      </div>
    </div>
  );
}