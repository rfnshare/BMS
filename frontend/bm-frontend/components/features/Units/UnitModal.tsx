import { useState } from "react";
import { Unit, UnitService } from "../../../logic/services/unitService";
import { Floor } from "../../../logic/services/floorService";

interface Props {
  floors: Floor[];
  unit: Unit | null;
  onClose: () => void;
  onSaved: () => void;
}

interface UnitForm {
  name: string;
  floor_id: number | "";
  unit_type: "residential" | "shop";
  status: "vacant" | "occupied" | "maintenance";
  monthly_rent: number | "";
  security_deposit: number | "";
  remarks: string;

  prepaid_electricity_meter_no: string;
  prepaid_electricity_old_meter_no: string;
  prepaid_electricity_customer_no: string;
  prepaid_gas_meter_customer_code: string;
  prepaid_gas_meter_prepaid_code: string;
  prepaid_gas_meter_no: string;
  prepaid_gas_card_no: string;
}

const prepaidFields: { key: keyof UnitForm; label: string }[] = [
  { key: "prepaid_electricity_meter_no", label: "Electricity Meter No" },
  { key: "prepaid_electricity_old_meter_no", label: "Old Meter No" },
  { key: "prepaid_electricity_customer_no", label: "Electricity Customer No" },
  { key: "prepaid_gas_meter_customer_code", label: "Gas Customer Code" },
  { key: "prepaid_gas_meter_prepaid_code", label: "Gas Prepaid Code" },
  { key: "prepaid_gas_meter_no", label: "Gas Meter No" },
  { key: "prepaid_gas_card_no", label: "Gas Card No" },
];

export default function UnitModal({ floors, unit, onClose, onSaved }: Props) {

  const [form, setForm] = useState<UnitForm>({
    name: unit?.name ?? "",
    floor_id: unit?.floor?.id ?? "",
    unit_type: unit?.unit_type ?? "residential",
    status: unit?.status ?? "vacant",
    monthly_rent: unit?.monthly_rent ?? "",
    security_deposit: unit?.security_deposit ?? "",
    remarks: unit?.remarks ?? "",

    prepaid_electricity_meter_no: unit?.prepaid_electricity_meter_no ?? "",
    prepaid_electricity_old_meter_no: unit?.prepaid_electricity_old_meter_no ?? "",
    prepaid_electricity_customer_no: unit?.prepaid_electricity_customer_no ?? "",
    prepaid_gas_meter_customer_code: unit?.prepaid_gas_meter_customer_code ?? "",
    prepaid_gas_meter_prepaid_code: unit?.prepaid_gas_meter_prepaid_code ?? "",
    prepaid_gas_meter_no: unit?.prepaid_gas_meter_no ?? "",
    prepaid_gas_card_no: unit?.prepaid_gas_card_no ?? "",
  });

  const update = <K extends keyof UnitForm>(key: K, value: UnitForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!form.name || !form.floor_id) return;

    if (unit) {
      await UnitService.update(unit.id, form);
    } else {
      await UnitService.create(form);
    }

    onSaved();
  };

  return (
    <>
      <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title">
                {unit ? "Edit Unit" : "Add Unit"}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* BODY */}
            <div className="modal-body">
              <div className="row g-3">

                <div className="col-md-4">
                  <label>Name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label>Floor</label>
                  <select
                    className="form-select"
                    value={form.floor_id}
                    onChange={e => update("floor_id", Number(e.target.value))}
                  >
                    <option value="">Select Floor</option>
                    {floors.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label>Unit Type</label>
                  <select
                    className="form-select"
                    value={form.unit_type}
                    onChange={e => update("unit_type", e.target.value as any)}
                  >
                    <option value="residential">Residential</option>
                    <option value="shop">Shop</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label>Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={e => update("status", e.target.value as any)}
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label>Monthly Rent</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.monthly_rent}
                    onChange={e => update("monthly_rent", Number(e.target.value))}
                  />
                </div>

                <div className="col-md-4">
                  <label>Security Deposit</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.security_deposit}
                    onChange={e => update("security_deposit", Number(e.target.value))}
                  />
                </div>

                <div className="col-12">
                  <label>Remarks</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.remarks}
                    onChange={e => update("remarks", e.target.value)}
                  />
                </div>

                <hr />
                <h6>Prepaid Utilities</h6>

                {prepaidFields.map(f => (
                  <div key={f.key} className="col-md-4">
                    <label>{f.label}</label>
                    <input
                      className="form-control"
                      value={form[f.key]}
                      onChange={e => update(f.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={save}>
                Save
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}