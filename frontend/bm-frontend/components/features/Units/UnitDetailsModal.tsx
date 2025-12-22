import React from 'react';
import { Modal, Button, Row, Col, Badge, Card } from 'react-bootstrap';

interface Props {
  unit: any;
  onClose: () => void;
}

export default function UnitDetailsModal({ unit, onClose }: Props) {
  if (!unit) return null;

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      vacant: "bg-success-subtle text-success border-success",
      occupied: "bg-danger-subtle text-danger border-danger",
      maintenance: "bg-warning-subtle text-warning border-warning",
    };
    return map[status?.toLowerCase()] || "bg-light text-muted border";
  };

  return (
    <Modal
      show onHide={onClose} size="lg" centered scrollable
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-house-gear fs-5 text-primary"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
              Asset Dashboard: {unit.name}
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Infrastructure Specs • ID #{unit.id}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        {/* 2. KPI OVERVIEW ROW */}
        <Row className="mb-4 g-3">
          <Col xs={12} md={6}>
            <Card className="h-100 border-0 shadow-sm rounded-4 p-3 border-start border-4 border-primary bg-white">
              <small className="text-muted fw-bold text-uppercase ls-1 mb-3 d-block" style={{ fontSize: '0.65rem' }}>Core Identity</small>
              <div className="vstack gap-2">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-1">
                  <span className="small text-muted">Current Status</span>
                  <Badge pill className={`px-3 py-1 x-small border ${getStatusBadge(unit.status)}`}>{unit.status?.toUpperCase()}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Unit Type</span>
                  <span className="fw-bold text-dark small text-capitalize">{unit.unit_type || 'Residential'}</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="h-100 border-0 shadow-sm rounded-4 p-3 border-start border-4 border-success bg-white">
              <small className="text-muted fw-bold text-uppercase ls-1 mb-3 d-block" style={{ fontSize: '0.65rem' }}>Financial Valuation</small>
              <div className="vstack gap-2">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-1">
                  <span className="small text-muted">Monthly Rent</span>
                  <span className="fw-bold text-primary">৳{Number(unit.monthly_rent || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Deposit</span>
                  <span className="fw-bold text-dark">৳{Number(unit.security_deposit || 0).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 3. UTILITY INFRASTRUCTURE */}
        <h6 className="fw-bold text-dark small text-uppercase ls-1 mb-3 px-1">
          <i className="bi bi-lightning-charge-fill text-warning me-2"></i>Utility Connections
        </h6>
        <Row className="mb-4 g-2 g-md-3">
          <Col xs={12} md={6}>
            <div className="p-3 bg-white shadow-sm rounded-4 border-top border-4 border-warning h-100">
              <div className="fw-bold x-small text-muted ls-1 text-uppercase mb-2">Electricity Metering</div>
              <div className="vstack gap-1">
                <div className="x-small d-flex justify-content-between"><span>Meter #:</span> <b className="text-dark">{unit.prepaid_electricity_meter_no || 'N/A'}</b></div>
                <div className="x-small d-flex justify-content-between"><span>Cust #:</span> <b className="text-dark">{unit.prepaid_electricity_customer_no || 'N/A'}</b></div>
              </div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="p-3 bg-white shadow-sm rounded-4 border-top border-4 border-warning h-100">
              <div className="fw-bold x-small text-muted ls-1 text-uppercase mb-2">Gas Metering</div>
              <div className="vstack gap-1">
                <div className="x-small d-flex justify-content-between"><span>Code:</span> <b className="text-dark">{unit.prepaid_gas_meter_customer_code || 'N/A'}</b></div>
                <div className="x-small d-flex justify-content-between"><span>Card #:</span> <b className="text-dark">{unit.prepaid_gas_card_no || 'N/A'}</b></div>
              </div>
            </div>
          </Col>
        </Row>

        {/* 4. DOCUMENTS GALLERY: ✅ Added & Connected */}
        <h6 className="fw-bold text-dark small text-uppercase ls-1 mb-3 px-1">
          <i className="bi bi-folder-check text-info me-2"></i>Evidence & Documents
        </h6>
        {unit.documents && unit.documents.length > 0 ? (
          <Row className="g-2 mb-4">
            {unit.documents.map((doc: any) => (
              <Col xs={6} md={4} key={doc.id}>
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
                  <a href={doc.file} target="_blank" rel="noreferrer" className="text-decoration-none">
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '100px' }}>
                      {doc.file.match(/\.(jpeg|jpg|gif|png)$/) ? (
                         <img src={doc.file} alt={doc.doc_type} className="w-100 h-100 object-fit-cover" />
                      ) : (
                         <i className="bi bi-file-earmark-pdf text-danger fs-1"></i>
                      )}
                    </div>
                  </a>
                  <div className="p-2 text-center">
                    <Badge bg="info" className="bg-opacity-10 text-info x-small text-uppercase ls-1 fw-bold">
                       {doc.doc_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-4 bg-white rounded-4 border border-dashed mb-4">
            <i className="bi bi-file-earmark-x display-6 text-light"></i>
            <p className="small text-muted italic mb-0 mt-2">No technical documents uploaded for this asset.</p>
          </div>
        )}

        {/* 5. MANAGEMENT REMARKS */}
        {unit.remarks && (
          <div className="p-3 bg-white shadow-sm rounded-4 border-start border-4 border-info">
            <small className="fw-bold d-block text-uppercase ls-1 text-muted mb-1" style={{ fontSize: '0.6rem' }}>Asset Remarks</small>
            <p className="small text-secondary mb-0 italic">"{unit.remarks}"</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-3 bg-white">
        <Button variant="light" className="rounded-pill px-4 border text-muted small fw-bold" onClick={onClose}>
          Exit Dashboard
        </Button>
      </Modal.Footer>
    </Modal>
  );
}