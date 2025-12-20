import { useState } from "react";
import { Unit, UnitService } from "../../../logic/services/unitService";
import { Floor } from "../../../logic/services/floorService";
import { Modal, Button } from "react-bootstrap";

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
  { key: "prepaid_electricity_meter_no", label: "Elec Meter No", icon: "lightning-charge" },
  { key: "prepaid_electricity_old_meter_no", label: "Elec Old Meter", icon: "arrow-counterclockwise" },
  { key: "prepaid_electricity_customer_no", label: "Elec Customer No", icon: "person-badge" },
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
    if (!form.name) newErrors.name = ["Required"];
    if (!form.floor) newErrors.floor = ["Required"];
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

  return (
    <Modal show onHide={onClose} size="xl" centered fullscreen="sm-down">
      <Modal.Header closeButton className="bg-success text-white p-3">
        <Modal.Title className="h6 fw-bold mb-0">{unit ? "Edit Unit" : "Add Unit"}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 bg-light">
        <div className="row g-3">
          {/* LEFT: BASIC INFO */}
          <div className="col-12 col-lg-7">
            <div className="bg-white p-3 rounded-4 shadow-sm border h-100">
              <h6 className="text-primary fw-bold small text-uppercase mb-3"><i className="bi bi-info-circle me-2"></i>Unit Details</h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Name/Number</label>
                  <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. A-101" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Floor</label>
                  <select className={`form-select ${errors.floor ? 'is-invalid' : ''}`} value={form.floor?.id ?? ""} onChange={e => update("floor", floors.find(f => f.id === Number(e.target.value)) ?? null)}>
                    <option value="">Select...</option>
                    {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Type</label>
                  <select className="form-select" value={form.unit_type} onChange={e => update("unit_type", e.target.value as any)}>
                    <option value="residential">Residential</option>
                    <option value="shop">Shop</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Status</label>
                  <select className="form-select" value={form.status} onChange={e => update("status", e.target.value as any)}>
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Monthly Rent</label>
                  <input type="number" className="form-control fw-bold" value={form.monthly_rent} onChange={e => update("monthly_rent", e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Security Deposit</label>
                  <input type="number" className="form-control" value={form.security_deposit} onChange={e => update("security_deposit", e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: UTILITIES */}
          <div className="col-12 col-lg-5">
            <div className="bg-white p-3 rounded-4 shadow-sm border h-100">
              <h6 className="text-success fw-bold small text-uppercase mb-3"><i className="bi bi-lightning-charge me-2"></i>Meters</h6>
              <div className="vstack gap-2">
                {prepaidFields.map(f => (
                  <div key={f.key}>
                    <label className="form-label x-small fw-bold text-muted mb-0">{f.label}</label>
                    <input className="form-control form-control-sm bg-light" value={form[f.key] as string} onChange={e => update(f.key, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-white p-3 border-top">
        <Button variant="outline-secondary" className="me-auto d-md-none border-0" onClick={onClose}>Cancel</Button>
        <Button variant="success" className="w-100 w-md-auto rounded-pill px-5 fw-bold shadow-sm" onClick={save}>
          {unit ? "Update" : "Save"}
        </Button>
        <Button variant="light" className="d-none d-md-block rounded-pill px-4 ms-2" onClick={onClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}