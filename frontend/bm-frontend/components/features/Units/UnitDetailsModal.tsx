import React from 'react';
import { Modal, Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { Unit } from '../../../logic/services/unitService';

interface UnitDetailsModalProps {
  unit: Unit | any;
  onClose: () => void;
}

export default function UnitDetailsModal({ unit, onClose }: UnitDetailsModalProps) {
  if (!unit) return null;

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      vacant: "bg-success-subtle text-success",
      occupied: "bg-danger-subtle text-danger",
      maintenance: "bg-warning-subtle text-warning",
    };
    return map[status] || "bg-light text-dark";
  };

  return (
    <Modal show onHide={onClose} size="lg" centered scrollable fullscreen="sm-down">
      <Modal.Header closeButton className="bg-light p-3 border-bottom">
        <Modal.Title className="h6 fw-bold mb-0">
          <i className="bi bi-house-door me-2 text-primary"></i>{unit.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 bg-light">
        <Row className="g-3 mb-3">
          <Col xs={12} md={6}>
            <Card className="border-0 shadow-sm p-3 h-100">
              <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                <span className="text-muted small fw-bold">STATUS</span>
                <Badge className={`rounded-pill ${getStatusBadge(unit.status)}`}>{unit.status.toUpperCase()}</Badge>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">Type</span>
                <span className="fw-bold small text-capitalize">{unit.unit_type}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Floor</span>
                <span className="fw-bold small">{unit.floor}</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="border-0 shadow-sm p-3 h-100">
              <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                <span className="text-muted small fw-bold">RENT</span>
                <span className="fw-bold text-primary">৳{Number(unit.monthly_rent).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Deposit</span>
                <span className="fw-bold small">৳{Number(unit.security_deposit).toLocaleString()}</span>
              </div>
            </Card>
          </Col>
        </Row>

        <h6 className="x-small fw-bold text-muted text-uppercase mb-2 px-1">Meters & Utilities</h6>
        <Row className="g-3 mb-3">
          <Col xs={12}>
            <div className="p-3 bg-white border rounded-3 shadow-sm">
              <div className="fw-bold small text-primary mb-2"><i className="bi bi-lightning-charge me-2"></i>Electricity</div>
              <div className="d-flex justify-content-between border-bottom border-light pb-1 mb-1">
                <span className="text-muted x-small">Meter No</span>
                <span className="fw-bold x-small">{unit.prepaid_electricity_meter_no || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted x-small">Customer No</span>
                <span className="fw-bold x-small">{unit.prepaid_electricity_customer_no || '-'}</span>
              </div>
            </div>
          </Col>
          <Col xs={12}>
            <div className="p-3 bg-white border rounded-3 shadow-sm">
              <div className="fw-bold small text-warning mb-2"><i className="bi bi-fire me-2"></i>Gas</div>
              <div className="d-flex justify-content-between border-bottom border-light pb-1 mb-1">
                <span className="text-muted x-small">Meter No</span>
                <span className="fw-bold x-small">{unit.prepaid_gas_meter_no || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted x-small">Card No</span>
                <span className="fw-bold x-small">{unit.prepaid_gas_card_no || '-'}</span>
              </div>
            </div>
          </Col>
        </Row>

        {unit.remarks && (
          <div className="p-3 bg-white border-start border-4 border-info rounded shadow-sm">
            <small className="fw-bold d-block x-small text-muted mb-1">REMARKS</small>
            <p className="small mb-0 text-dark">{unit.remarks}</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-white p-3 border-top">
        <Button variant="secondary" className="w-100 rounded-pill fw-bold" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}