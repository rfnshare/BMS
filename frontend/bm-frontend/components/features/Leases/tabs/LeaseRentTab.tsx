import { useEffect, useState } from "react";
import api from "../../../../logic/services/apiClient";

export default function LeaseRentTab({ form, setForm }: any) {
  const [rentTypes, setRentTypes] = useState<any[]>([]);

  useEffect(() => {
    api.get("/leases/rent-types/?is_active=true")
      .then(r => setRentTypes(r.data.results || r.data));
  }, []);

  const addRent = () => {
    setForm((p: any) => ({
      ...p,
      lease_rents: [...p.lease_rents, { rent_type: "", amount: "" }]
    }));
  };

  const updateRent = (i: number, key: string, value: any) => {
    const updated = [...form.lease_rents];
    updated[i][key] = value;
    setForm({ ...form, lease_rents: updated });
  };

  const removeRent = (i: number) => {
    const updated = [...form.lease_rents];
    updated.splice(i, 1);
    setForm({ ...form, lease_rents: updated });
  };

  const total = form.lease_rents.reduce(
    (s: number, r: any) => s + Number(r.amount || 0),
    0
  );

  return (
    <>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Rent Type</th>
            <th width="200">Amount</th>
            <th width="60"></th>
          </tr>
        </thead>
        <tbody>
          {form.lease_rents.map((r: any, i: number) => (
            <tr key={i}>
              <td>
                <select
                  className="form-select"
                  value={r.rent_type}
                  onChange={e => updateRent(i, "rent_type", Number(e.target.value))}
                >
                  <option value="">Select rent type</option>
                  {rentTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={r.amount}
                  onChange={e => updateRent(i, "amount", e.target.value)}
                />
              </td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeRent(i)}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
          {form.lease_rents.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-muted">
                No rent items added
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-primary" onClick={addRent}>
          + Add Rent Type
        </button>
        <strong>Total Rent: {total}</strong>
      </div>
    </>
  );
}
