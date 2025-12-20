import { useEffect, useState } from "react";
import api from "../../../../logic/services/apiClient";

export default function LeaseRentTab({ form, updateRent, addRentRow, removeRent, totalRent }: any) {
  const [rentTypes, setRentTypes] = useState<any[]>([]);

  useEffect(() => {
    api.get("/leases/rent-types/?is_active=true").then(r => setRentTypes(r.data.results || r.data));
  }, []);

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold text-primary mb-0 small text-uppercase">Breakdown</h6>
        <button className="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-sm" onClick={addRentRow}>
          <i className="bi bi-plus-circle me-1"></i> Add
        </button>
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden border mb-3">
        <ul className="list-group list-group-flush">
          {form.lease_rents.map((r: any, i: number) => (
            <li key={i} className="list-group-item p-3 bg-transparent">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-6">
                  <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Type</label>
                  <select
                    className="form-select border-0 bg-light py-2"
                    value={r.rent_type}
                    onChange={e => updateRent(i, "rent_type", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {rentTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                  </select>
                </div>
                <div className="col-8 col-md-4">
                  <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Amount</label>
                  <div className="input-group">
                    <span className="input-group-text border-0 bg-light">৳</span>
                    <input
                      type="number"
                      className="form-control border-0 bg-light fw-bold py-2"
                      value={r.amount}
                      onChange={e => updateRent(i, "amount", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-4 col-md-2 text-end">
                  <label className="d-block mb-1 opacity-0">Del</label>
                  <button className="btn btn-outline-danger w-100 border-0 bg-danger-subtle text-danger rounded-3" onClick={() => removeRent(i)}>
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            </li>
          ))}
          {form.lease_rents.length === 0 && (
            <li className="list-group-item p-5 text-center text-muted italic small">
              No charges added. Tap "+ Add" to begin.
            </li>
          )}
        </ul>
      </div>

      {/* TOTAL BAR - FIXED BOTTOM STYLE FOR MOBILE */}
      <div className="p-3 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-25 d-flex justify-content-between align-items-center">
          <span className="fw-bold text-primary small text-uppercase">Total Monthly Rent</span>
          <span className="h4 fw-bold text-primary mb-0">৳{totalRent.toLocaleString()}</span>
      </div>
    </div>
  );
}