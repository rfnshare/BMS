import { Modal, Button, Spinner, Form, Row, Col } from "react-bootstrap";
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
    <Modal
      show onHide={onClose} size="xl" centered backdrop="static"
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className={`bi ${unit ? 'bi-pencil-square text-warning' : 'bi-building-add text-primary'} fs-5`}></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0">
              {unit ? `Edit Unit: ${unit.name}` : "Create New Unit"}
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>
              Infrastructure Management
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        <div className="row g-4">
          {/* LEFT COLUMN: CORE INFO */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
              <h6 className="fw-bold text-primary mb-4 text-uppercase small ls-1 border-bottom pb-2">
                <i className="bi bi-info-circle me-2"></i>General Information
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="x-small fw-bold text-muted mb-1 ls-1 text-uppercase">
                    UNIT NAME / NO <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    className={`rounded-pill bg-light border-0 py-2 ps-3 fw-bold small ${errors.name ? 'is-invalid' : ''}`}
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                    placeholder="e.g. A-101"
                  />
                  {errors.name && <div className="invalid-feedback ps-2">{errors.name[0]}</div>}
                </Col>

                <Col md={6}>
                  <Form.Label className="x-small fw-bold text-muted mb-1 ls-1 text-uppercase">
                    FLOOR <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    className={`rounded-pill bg-light border-0 py-2 ps-3 fw-bold small ${errors.floor ? 'is-invalid' : ''}`}
                    value={form.floor?.id ?? ""}
                    onChange={e => update("floor", floors.find(f => f.id === Number(e.target.value)))}
                  >
                    <option value="">Select Floor...</option>
                    {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </Form.Select>
                  {errors.floor && <div className="invalid-feedback ps-2">{errors.floor[0]}</div>}
                </Col>

                <Col md={6}>
                  <Form.Label className="x-small fw-bold text-muted mb-1 ls-1 text-uppercase">
                    UNIT TYPE <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small"
                    value={form.unit_type}
                    onChange={e => update("unit_type", e.target.value)}
                  >
                    <option value="residential">Residential</option>
                    <option value="shop">Shop</option>
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label className="x-small fw-bold text-muted mb-1 ls-1 text-uppercase">
                    STATUS <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small"
                    value={form.status}
                    onChange={e => update("status", e.target.value)}
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label className="x-small fw-bold text-muted mb-1 ls-1 text-uppercase">MONTHLY RENT (৳)</Form.Label>
                  <Form.Control
                    type="number" className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold text-primary"
                    value={form.monthly_rent}
                    onChange={e => update("monthly_rent", e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label className="x-small fw-bold text-muted mb-1 ls-1 text-uppercase">SECURITY DEPOSIT (৳)</Form.Label>
                  <Form.Control
                    type="number" className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold"
                    value={form.security_deposit}
                    onChange={e => update("security_deposit", e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </Col>
              </Row>
            </div>
          </div>

          {/* RIGHT COLUMN: UTILITY METERS */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-4 border-warning h-100">
              <h6 className="fw-bold text-warning mb-4 text-uppercase small ls-1 border-bottom pb-2">
                <i className="bi bi-lightning-charge me-2"></i>Utility Meters
              </h6>
              <div className="vstack gap-2">
                {meterFields.map(field => (
                  <div key={field.key}>
                    <Form.Label className="x-small fw-bold text-muted mb-1 ls-1 text-uppercase">{field.label}</Form.Label>
                    <Form.Control
                      className="rounded-pill bg-light border-0 py-1 ps-3 small fw-bold"
                      value={(form as any)[field.key] || ""}
                      onChange={e => update(field.key, e.target.value)}
                    />
                    {errors[field.key] && <div className="text-danger x-small mt-1 ps-2">{errors[field.key][0]}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-white border-top p-3 d-flex justify-content-end gap-2 px-md-5">
        <Button variant="light" className="px-4 rounded-pill border text-muted small fw-bold" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={unit ? "warning" : "success"}
          className="px-5 rounded-pill fw-bold shadow-sm"
          onClick={save}
          disabled={isSaving}
        >
          {isSaving ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-check-lg me-2"></i>}
          {unit ? "Save Changes" : "Create Unit"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}