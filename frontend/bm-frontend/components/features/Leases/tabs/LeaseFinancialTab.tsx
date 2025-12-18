import { useEffect, useState } from "react";
import { RentTypeService } from "../../../../logic/services/rentTypeService";

export default function LeaseFinancialTab({ form, setForm }: any) {
  const [rentTypes, setRentTypes] = useState<any[]>([]);

  useEffect(() => {
    RentTypeService.list().then(r => setRentTypes(r.results || r));
  }, []);

  const updateRent = (typeId: number, amount: number) => {
    const rents = [...(form.lease_rents || [])];
    const idx = rents.findIndex((r: any) => r.rent_type === typeId);

    if (idx >= 0) rents[idx].amount = amount;
    else rents.push({ rent_type: typeId, amount });

    setForm({ ...form, lease_rents: rents });
  };

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <label>Base Rent *</label>
        <input
          type="number"
          className="form-control"
          value={form.rent_amount || ""}
          onChange={e => setForm({ ...form, rent_amount: e.target.value })}
        />
      </div>

      <div className="col-md-4">
        <label>Security Deposit</label>
        <input
          type="number"
          className="form-control"
          value={form.security_deposit || ""}
          onChange={e => setForm({ ...form, security_deposit: e.target.value })}
        />
      </div>

      <div className="col-md-4">
        <label>Deposit Status</label>
        <select
          className="form-select"
          value={form.deposit_status || "pending"}
          onChange={e => setForm({ ...form, deposit_status: e.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="adjusted">Adjusted</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <hr />
      <h6>Additional Rent Components</h6>

      {rentTypes.map(rt => (
        <div key={rt.id} className="col-md-4">
          <label>{rt.name}</label>
          <input
            type="number"
            className="form-control"
            onChange={e => updateRent(rt.id, Number(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}
