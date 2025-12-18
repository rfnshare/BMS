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
        <h6 className="fw-bold text-primary mb-0">Monthly Billing Breakdown</h6>
        <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={addRentRow}>
          <i className="bi bi-plus-circle me-2"></i>Add Charge
        </button>
      </div>

      <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
        <ul className="list-group list-group-flush">
          {form.lease_rents.map((r: any, i: number) => (
            <li key={i} className="list-group-item p-3 bg-transparent">
              <div className="row g-2 align-items-end">
                <div className="col-md-6">
                  <label className="small text-muted fw-bold">Charge Category</label>
                  <select
                    className="form-select border-0 bg-light"
                    value={r.rent_type}
                    onChange={e => updateRent(i, "rent_type", e.target.value)}
                  >
                    <option value="">Select Type...</option>
                    {rentTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="small text-muted fw-bold">Monthly Amount</label>
                  <div className="input-group">
                    <span className="input-group-text border-0 bg-light">৳</span>
                    <input
                      type="number"
                      className="form-control border-0 bg-light"
                      value={r.amount}
                      onChange={e => updateRent(i, "amount", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-2 text-end">
                  <button className="btn btn-link text-danger text-decoration-none" onClick={() => removeRent(i)}>
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            </li>
          ))}
          {form.lease_rents.length === 0 && (
            <li className="list-group-item p-5 text-center text-muted italic">
              No rent items added yet. Click "+ Add Charge" to define the monthly rent.
            </li>
          )}
        </ul>
        <div className="p-3 bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
          <span className="fw-bold text-primary">Total Monthly Rent:</span>
          <span className="fs-4 fw-bold text-primary">৳{totalRent.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}