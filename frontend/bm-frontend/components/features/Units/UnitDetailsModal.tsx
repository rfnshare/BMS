import React from 'react';
import { Modal, Button, Row, Col, Badge, ListGroup, Card } from 'react-bootstrap';
import { Unit } from '../../../logic/services/unitService';

interface UnitDetailsModalProps {
  unit: Unit | any; // Using any to handle the extra meter fields
  onClose: () => void;
}

export default function UnitDetailsModal({ unit, onClose }: UnitDetailsModalProps) {
  if (!unit) return null;

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      vacant: "bg-success-subtle text-success border-success-subtle",
      occupied: "bg-danger-subtle text-danger border-danger-subtle",
      maintenance: "bg-warning-subtle text-warning border-warning-subtle",
    };
    return map[status] || "bg-light text-dark border";
  };

  return (
    <Modal show onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="h6 fw-bold">
          <i className="bi bi-house-door me-2 text-primary"></i>
          Unit Details: {unit.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Basic Info & Financials */}
        <Row className="mb-4 g-3">
          <Col md={6}>
            <Card className="h-100 border-0 bg-light p-3">
              <small className="text-muted fw-bold text-uppercase x-small">Core Information</small>
              <div className="mt-2">
                <div className="d-flex justify-content-between mb-1">
                  <span>Status:</span>
                  <Badge className={`rounded-pill ${getStatusBadge(unit.status)}`}>{unit.status}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Type:</span>
                  <span className="text-capitalize fw-semibold">{unit.unit_type}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Floor:</span>
                  <span className="fw-semibold">{unit.floor}</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 border-0 bg-light p-3">
              <small className="text-muted fw-bold text-uppercase x-small">Financials (Monthly)</small>
              <div className="mt-2">
                <div className="d-flex justify-content-between mb-1">
                  <span>Rent:</span>
                  <span className="fw-bold text-primary">৳{Number(unit.monthly_rent).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Security Deposit:</span>
                  <span className="fw-bold">৳{Number(unit.security_deposit).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Technical Utilities (Electricity & Gas) */}
        <h6 className="fw-bold border-bottom pb-2 mb-3">Utility Connections</h6>
        <Row className="mb-4 g-3">
          <Col md={6}>
            <div className="p-3 border rounded-3 h-100">
              <div className="fw-bold small mb-2 text-primary"><i className="bi bi-lightning-charge me-2"></i>Electricity (Prepaid)</div>
              <div className="x-small text-muted">Meter No: <b className="text-dark">{unit.prepaid_electricity_meter_no || 'N/A'}</b></div>
              <div className="x-small text-muted">Old Meter: <b className="text-dark">{unit.prepaid_electricity_old_meter_no || 'N/A'}</b></div>
              <div className="x-small text-muted">Customer No: <b className="text-dark">{unit.prepaid_electricity_customer_no || 'N/A'}</b></div>
            </div>
          </Col>
          <Col md={6}>
            <div className="p-3 border rounded-3 h-100">
              <div className="fw-bold small mb-2 text-warning"><i className="bi bi-fire me-2"></i>Gas Connection</div>
              <div className="x-small text-muted">Customer Code: <b className="text-dark">{unit.prepaid_gas_meter_customer_code || 'N/A'}</b></div>
              <div className="x-small text-muted">Meter No: <b className="text-dark">{unit.prepaid_gas_meter_no || 'N/A'}</b></div>
              <div className="x-small text-muted">Card No: <b className="text-dark">{unit.prepaid_gas_card_no || 'N/A'}</b></div>
            </div>
          </Col>
        </Row>

        {/* Documents Gallery */}
        <h6 className="fw-bold border-bottom pb-2 mb-3">Unit Documents</h6>
        {unit.documents && unit.documents.length > 0 ? (
          <Row className="g-2">
            {unit.documents.map((doc: any) => (
              <Col xs={6} md={4} key={doc.id}>
                <div className="border rounded overflow-hidden shadow-sm">
                  <a href={doc.file} target="_blank" rel="noreferrer">
                    <img src={doc.file} alt={doc.doc_type} className="img-fluid" style={{ height: '120px', width: '100%', objectFit: 'cover' }} />
                  </a>
                  <div className="p-2 bg-light x-small text-center text-truncate text-capitalize">
                    {doc.doc_type.replace('_', ' ')}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-4 text-muted border border-dashed rounded-3">
            <i className="bi bi-file-earmark-x d-block display-6 mb-2"></i>
            No documents uploaded for this unit.
          </div>
        )}

        {unit.remarks && (
          <div className="mt-4 p-3 bg-light border-start border-4 border-info">
            <small className="fw-bold d-block text-uppercase x-small text-muted">Remarks</small>
            <p className="small mb-0 mt-1">{unit.remarks}</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}