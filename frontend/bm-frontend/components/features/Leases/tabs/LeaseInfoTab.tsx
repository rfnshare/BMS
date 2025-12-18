import { useEffect, useState } from "react";
import api from "../../../../logic/services/apiClient";

export default function LeaseInfoTab({ form, setForm }: any) {
  const [renters, setRenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    api.get("/renters/?status=active").then(r => setRenters(r.data.results));
    api.get("/buildings/units/?status=vacant").then(r => setUnits(r.data.results));
  }, []);

  const update = (k: string, v: any) =>
    setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <label>Renter *</label>
        <select
          className="form-select"
          value={form.renter}
          onChange={e => update("renter", Number(e.target.value))}
        >
          <option value="">Select renter</option>
          {renters.map(r => (
            <option key={r.id} value={r.id}>{r.full_name}</option>
          ))}
        </select>
      </div>

      <div className="col-md-6">
        <label>Unit *</label>
        <select
          className="form-select"
          value={form.unit}
          onChange={e => update("unit", Number(e.target.value))}
        >
          <option value="">Select unit</option>
          {units.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} (Rent {u.monthly_rent}, Deposit {u.security_deposit})
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-4">
        <label>Start Date *</label>
        <input
          type="date"
          className="form-control"
          value={form.start_date}
          onChange={e => update("start_date", e.target.value)}
        />
      </div>

      <div className="col-md-4">
        <label>Status</label>
        <select
          className="form-select"
          value={form.status}
          onChange={e => update("status", e.target.value)}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
        </select>
      </div>

      <div className="col-md-4">
        <label>Deposit Status</label>
        <select
          className="form-select"
          value={form.deposit_status}
          onChange={e => update("deposit_status", e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="col-12">
        <label>Remarks</label>
        <textarea
          className="form-control"
          rows={3}
          value={form.remarks}
          onChange={e => update("remarks", e.target.value)}
        />
      </div>
    </div>
  );
}
