import { useEffect, useState } from "react";
import { LeaseService } from "../../../logic/services/leaseService";
import { Spinner, Row, Col, Card, Badge, Container } from "react-bootstrap";

export default function RenterUnitDetails() {
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResidency = async () => {
      try {
        const activeLease = await LeaseService.getMyActiveLease();
        setLease(activeLease);
      } catch (error) {
        console.error("Failed to load unit details", error);
      } finally {
        setLoading(false);
      }
    };
    loadResidency();
  }, []);

  if (loading) return (
    <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted small fw-bold text-uppercase">Fetching unit data...</p>
    </div>
  );

  if (!lease) return (
    <Container className="text-center py-5">
      <div className="card border-0 shadow-sm p-5 rounded-4 bg-white">
        <i className="bi bi-house-x text-muted display-1 mb-3"></i>
        <h5 className="fw-bold">No Active Lease</h5>
        <p className="text-muted small">We couldn't find an active agreement for your account.</p>
      </div>
    </Container>
  );

  const HandoverItem = ({ label, done }: { label: string; done: boolean }) => (
    <div className="d-flex flex-column align-items-center p-2 rounded-3 border bg-white h-100">
      <span className="text-muted mb-1" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</span>
      {done ? (
        <Badge bg="success-subtle" text="success" className="rounded-pill x-small border border-success">
          <i className="bi bi-check-circle-fill"></i> Received
        </Badge>
      ) : (
        <Badge bg="light" text="muted" className="rounded-pill x-small border">
          <i className="bi bi-dash-circle"></i> Pending
        </Badge>
      )}
    </div>
  );

  return (
    <Container fluid className="animate__animated animate__fadeIn p-2 p-md-0 pb-5">
      <Row className="g-3 g-md-4 flex-column-reverse flex-lg-row">

        {/* LEFT COLUMN: UNIT INFO & DOCUMENTS */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 p-3 p-md-4 mb-3 mb-md-4 bg-white">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <Badge bg="success" className="mb-2 px-3 rounded-pill text-uppercase" style={{ fontSize: '0.65rem' }}>
                    {lease.status} residency
                </Badge>
                <h4 className="fw-bold text-dark">Agreement Details</h4>
              </div>
              <div className="text-end">
                <div className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Move-in</div>
                <div className="fw-bold text-primary small">{new Date(lease.start_date).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Rent Breakdown Table */}
            <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Monthly Rent Breakdown</h6>
            <div className="bg-light rounded-4 p-3 mb-4">
              {lease.lease_rents?.map((item: any) => (
                <div key={item.id} className="d-flex justify-content-between mb-2 small">
                  <span className="text-secondary">{item.rent_type_name}</span>
                  <span className="fw-bold text-dark">৳{Number(item.amount).toLocaleString()}</span>
                </div>
              ))}
              <hr className="my-2 opacity-10" />
              <div className="d-flex justify-content-between text-dark fw-bold">
                <span className="small">Total Commitment</span>
                <span className="text-primary">৳{Number(lease.rent_amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Handover Checklist (2x2 Grid on Mobile) */}
            <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Handover Checklist</h6>
            <Row className="g-2">
              <Col xs={6} md={4}><HandoverItem label="Electricity" done={lease.electricity_card_given} /></Col>
              <Col xs={6} md={4}><HandoverItem label="Gas Card" done={lease.gas_card_given} /></Col>
              <Col xs={6} md={4}><HandoverItem label="Gate Key" done={lease.main_gate_key_given} /></Col>
              <Col xs={6} md={4}><HandoverItem label="Pocket Key" done={lease.pocket_gate_key_given} /></Col>
              <Col xs={6} md={4}><HandoverItem label="Agreement" done={lease.agreement_paper_given} /></Col>
              <Col xs={6} md={4}><HandoverItem label="Police Ver." done={lease.police_verification_done} /></Col>
            </Row>
          </Card>

          {/* Documents Section */}
          {lease.documents?.length > 0 && (
            <Card className="border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white">
              <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Legal Documents</h6>
              <div className="list-group list-group-flush">
                {lease.documents.map((doc: any) => (
                  <a key={doc.id} href={doc.file} target="_blank" rel="noreferrer" className="list-group-item list-group-item-action border-0 px-0 d-flex align-items-center py-3">
                    <div className="bg-danger bg-opacity-10 p-2 rounded-3 me-3">
                        <i className="bi bi-file-earmark-pdf text-danger fs-5"></i>
                    </div>
                    <div className="overflow-hidden">
                      <div className="fw-bold small text-capitalize text-truncate">{doc.doc_type} Agreement</div>
                      <div className="x-small text-muted">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                    </div>
                    <i className="bi bi-cloud-arrow-down ms-auto text-primary fs-5"></i>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </Col>

        {/* RIGHT COLUMN (TOP ON MOBILE): BALANCE */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-dark text-white mb-3 mb-md-4">
            <div className="opacity-75 small text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem' }}>Outstanding Balance</div>
            <h2 className="display-6 fw-bold mb-4 text-warning">৳{Number(lease.current_balance).toLocaleString()}</h2>

            <Row className="g-0 border-top border-secondary border-opacity-50 pt-3">
              <Col xs={12} className="mb-3">
                <div className="opacity-50 small text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Security Deposit</div>
                <div className="h5 fw-bold mb-1">৳{Number(lease.security_deposit).toLocaleString()}</div>
                <Badge bg={lease.deposit_status === 'pending' ? 'warning' : 'success'} className="fw-bold x-small">
                  {lease.deposit_status?.toUpperCase()}
                </Badge>
              </Col>
              <Col xs={12}>
                <div className="opacity-50 x-small italic mt-2">
                    Lease ID: #LS-{lease.id.toString().padStart(4, '0')}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Management Remarks */}
          {lease.remarks && (
            <Card className="border-0 shadow-sm rounded-4 p-3 bg-info bg-opacity-10 border-start border-5 border-info">
                <h6 className="fw-bold text-info small text-uppercase" style={{ fontSize: '0.65rem' }}>From Management</h6>
                <p className="small text-dark mb-0 font-italic">"{lease.remarks}"</p>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}