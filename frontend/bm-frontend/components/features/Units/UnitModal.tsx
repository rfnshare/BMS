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
  floor: Floor | null;
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

const prepaidFields: { key: keyof UnitForm; label: string; icon: string }[] = [
  { key: "prepaid_electricity_meter_no", label: "Electricity Meter No", icon: "lightning-charge" },
  { key: "prepaid_electricity_old_meter_no", label: "Old Meter No", icon: "arrow-counterclockwise" },
  { key: "prepaid_electricity_customer_no", label: "Customer No", icon: "person-badge" },
  { key: "prepaid_gas_meter_customer_code", label: "Gas Customer Code", icon: "fire" },
  { key: "prepaid_gas_meter_prepaid_code", label: "Gas Prepaid Code", icon: "hash" },
  { key: "prepaid_gas_meter_no", label: "Gas Meter No", icon: "speedometer" },
  { key: "prepaid_gas_card_no", label: "Gas Card No", icon: "credit-card-2-front" },
];

export default function UnitModal({ floors, unit, onClose, onSaved }: Props) {
  const [form, setForm] = useState<UnitForm>({
    name: unit?.name ?? "",
    floor: unit?.floor ?? null,
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

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const update = <K extends keyof UnitForm>(key: K, value: UnitForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    const newErrors: Record<string, string[]> = {};
    if (!form.name) newErrors.name = ["Name is required"];
    if (!form.floor) newErrors.floor = ["Floor is required"];
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const payload = { ...form, floor: form.floor?.id };

    try {
      if (unit) await UnitService.update(unit.id, payload);
      else await UnitService.create(payload);
      onSaved();
    } catch (err: any) {
      if (err.response?.data) setErrors(err.response.data);
    }
  };

  const SectionHeader = ({ title, icon, color }: { title: string; icon: string; color: string }) => (
    <div className={`d-flex align-items-center gap-2 mb-3 mt-2 text-${color}`}>
      <i className={`bi bi-${icon} fs-5`}></i>
      <h6 className="fw-bold mb-0 text-uppercase small" style={{ letterSpacing: '1px' }}>{title}</h6>
    </div>
  );

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered shadow-lg">
        <div className="modal-content border-0 rounded-4 overflow-hidden">

          {/* HEADER */}
          <div className="modal-header bg-success text-white border-0 p-4">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-25 rounded-circle p-2">
                <i className={`bi bi-${unit ? 'pencil-square' : 'plus-circle'} fs-4`}></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">{unit ? "Edit Unit Configuration" : "Add New Unit"}</h5>
                <p className="mb-0 small opacity-75">Fill in the details to manage your property unit.</p>
              </div>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <div className="modal-body p-4 bg-light bg-opacity-50">
            <div className="row g-4">

              {/* LEFT COLUMN: PRIMARY INFO */}
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                  <SectionHeader title="Basic Information" icon="info-circle" color="primary" />

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Unit Name/Number</label>
                      <input
                        className={`form-control rounded-3 ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="e.g. A-101"
                        value={form.name}
                        onChange={e => update("name", e.target.value)}
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Floor Level</label>
                      <select
                        className={`form-select rounded-3 ${errors.floor ? 'is-invalid' : ''}`}
                        value={form.floor?.id ?? ""}
                        onChange={e => {
                          const floor = floors.find(f => f.id === Number(e.target.value)) ?? null;
                          update("floor", floor);
                        }}
                      >
                        <option value="">Choose Floor...</option>
                        {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                      {errors.floor && <div className="invalid-feedback">{errors.floor[0]}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Unit Type</label>
                      <div className="d-flex gap-2">
                        {["residential", "shop"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            className={`btn btn-sm flex-grow-1 rounded-pill ${form.unit_type === type ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => update("unit_type", type as any)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Status</label>
                      <select
                        className={`form-select rounded-3 text-${form.status === 'vacant' ? 'success' : form.status === 'occupied' ? 'primary' : 'warning'}`}
                        value={form.status}
                        onChange={e => update("status", e.target.value as any)}
                      >
                        <option value="vacant">Vacant</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Monthly Rent (৳)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">৳</span>
                        <input
                          type="number"
                          className="form-control border-start-0 ps-0"
                          value={form.monthly_rent}
                          onChange={e => update("monthly_rent", e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Security Deposit (৳)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">৳</span>
                        <input
                          type="number"
                          className="form-control border-start-0 ps-0"
                          value={form.security_deposit}
                          onChange={e => update("security_deposit", e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Admin Remarks</label>
                      <textarea
                        className="form-control rounded-3"
                        rows={3}
                        placeholder="Add any internal notes about this unit..."
                        value={form.remarks}
                        onChange={e => update("remarks", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PREPAID UTILITIES */}
              <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <SectionHeader title="Prepaid Utilities" icon="lightning-charge" color="success" />

                  <div className="bg-success bg-opacity-10 p-3 rounded-4 mb-4 small text-success">
                    <i className="bi bi-shield-check me-2"></i>
                    Enter meter details to automate billing for this unit.
                  </div>

                  <div className="row g-3 overflow-auto" style={{ maxHeight: '400px' }}>
                    {prepaidFields.map(f => (
                      <div key={f.key} className="col-12">
                        <label className="form-label small fw-bold text-muted mb-1">
                          <i className={`bi bi-${f.icon} me-2`}></i>{f.label}
                        </label>
                        <input
                          className="form-control form-control-sm rounded-3 bg-light border-0"
                          value={form[f.key] as string}
                          onChange={e => update(f.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer bg-white border-0 p-4 shadow-sm">
            <button className="btn btn-light rounded-pill px-4 me-2 fw-medium" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-success rounded-pill px-5 fw-bold shadow-sm" onClick={save}>
              <i className="bi bi-save me-2"></i>{unit ? "Update Unit" : "Create Unit"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}