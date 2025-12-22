import { Modal, Button, Spinner } from "react-bootstrap";
import { useUnitForm } from "../../../logic/hooks/useUnitForm";
import { Unit } from "../../../logic/services/unitService";
import { Floor } from "../../../logic/services/floorService";

interface Props {
  floors: Floor[];
  unit: Unit | null;
  onClose: () => void;
  onSaved: () => void;
}

const meterFields = [
  { key: "prepaid_electricity_meter_no", label: "Electricity Meter No" },
  { key: "prepaid_electricity_old_meter_no", label: "Electricity Old Meter" },
  { key: "prepaid_electricity_customer_no", label: "Electricity Customer No" },
  { key: "prepaid_gas_meter_customer_code", label: "Gas Customer Code" },
  { key: "prepaid_gas_meter_no", label: "Gas Meter No" },
  { key: "prepaid_gas_card_no", label: "Gas Card No" },
];

export default function UnitModal({ floors, unit, onClose, onSaved }: Props) {
  const { form, errors, isSaving, update, save } = useUnitForm(unit, floors, onSaved, onClose);

  return (
    <Modal show onHide={onClose} size="xl" centered backdrop="static">
      <Modal.Header closeButton className="bg-success text-white border-0">
        <Modal.Title className="h6 fw-bold">
          <i className="bi bi-building-add me-2"></i>
          {unit ? `Edit Unit: ${unit.name}` : "Create New Unit"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        <div className="row g-4">

          {/* LEFT COLUMN: CORE INFO */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
              <h6 className="fw-bold text-primary mb-3 text-uppercase small ls-1">General Information</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="x-small fw-bold text-muted mb-1">UNIT NAME / NO</label>
                  <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. A-101" />
                  {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                </div>

                <div className="col-md-6">
                  <label className="x-small fw-bold text-muted mb-1">FLOOR</label>
                  <select className={`form-select ${errors.floor ? 'is-invalid' : ''}`} value={form.floor?.id ?? ""} onChange={e => update("floor", floors.find(f => f.id === Number(e.target.value)))}>
                    <option value="">Select Floor...</option>
                    {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  {errors.floor && <div className="invalid-feedback">{errors.floor[0]}</div>}
                </div>

                <div className="col-md-6">
                  <label className="x-small fw-bold text-muted mb-1">MONTHLY RENT (৳)</label>
                  <input type="number" className="form-control fw-bold text-primary" value={form.monthly_rent} onChange={e => update("monthly_rent", e.target.value === "" ? "" : Number(e.target.value))} />
                </div>

                <div className="col-md-6">
                  <label className="x-small fw-bold text-muted mb-1">SECURITY DEPOSIT (৳)</label>
                  <input type="number" className="form-control" value={form.security_deposit} onChange={e => update("security_deposit", e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: UTILITY METERS */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-top border-4 border-warning">
              <h6 className="fw-bold text-warning mb-3 text-uppercase small ls-1">Utility Meters</h6>
              <div className="vstack gap-2">
                {meterFields.map(field => (
                  <div key={field.key}>
                    <label className="x-small fw-bold text-muted mb-0">{field.label}</label>
                    <input className="form-control form-control-sm bg-light border-0" value={(form as any)[field.key]} onChange={e => update(field.key, e.target.value)} />
                    {errors[field.key] && <div className="text-danger x-small mt-1">{errors[field.key][0]}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </Modal.Body>

      <Modal.Footer className="bg-white border-0 p-3">
        <Button variant="light" className="px-4 rounded-pill" onClick={onClose}>Cancel</Button>
        <Button variant="success" className="px-5 rounded-pill fw-bold shadow-sm" onClick={save} disabled={isSaving}>
          {isSaving ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-check-lg me-2"></i>}
          {unit ? "Save Changes" : "Create Unit"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}