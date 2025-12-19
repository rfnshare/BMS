import { useEffect, useState } from "react";
import { LeaseService } from "../../../logic/services/leaseService";
import { Spinner, Row, Col, Card, Badge, ListGroup } from "react-bootstrap";

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

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  if (!lease) return <div className="text-center py-5 text-muted">No active lease found.</div>;

  const HandoverItem = ({ label, done }: { label: string; done: boolean }) => (
    <div className="d-flex justify-content-between align-items-center mb-2">
      <span className="small text-muted">{label}</span>
      {done ? (
        <Badge bg="success-subtle" text="success" className="rounded-pill px-2">
          <i className="bi bi-check-circle-fill me-1"></i> Received
        </Badge>
      ) : (
        <Badge bg="light" text="muted" className="rounded-pill px-2 border">
          <i className="bi bi-dash-circle me-1"></i> Pending
        </Badge>
      )}
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn pb-5">
      <Row className="g-4">
        {/* LEFT COLUMN: PRIMARY INFO */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <Badge bg="success" className="mb-2 px-3 rounded-pill text-uppercase" style={{ fontSize: '0.7rem' }}>
                    {lease.status} residency
                </Badge>
                <h3 className="fw-bold text-dark">Unit Details</h3>
              </div>
              <div className="text-end">
                <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Move-in Date</div>
                <div className="fw-bold text-primary">{new Date(lease.start_date).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Rent Breakdown Table */}
            <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem' }}>Monthly Rent Breakdown</h6>
            <div className="bg-light rounded-4 p-3 mb-4">
              {lease.lease_rents?.map((item: any) => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">{item.rent_type_name}</span>
                  <span className="fw-bold">৳{Number(item.amount).toLocaleString()}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between text-dark fw-bold">
                <span>Total Monthly Commitment</span>
                <span>৳{Number(lease.rent_amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Handover Checklist */}
            <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem' }}>Handover Checklist</h6>
            <Row className="g-3">
              <Col md={6}>
                <HandoverItem label="Electricity Card" done={lease.electricity_card_given} />
                <HandoverItem label="Gas Card" done={lease.gas_card_given} />
                <HandoverItem label="Main Gate Key" done={lease.main_gate_key_given} />
              </Col>
              <Col md={6}>
                <HandoverItem label="Pocket Gate Key" done={lease.pocket_gate_key_given} />
                <HandoverItem label="Agreement Paper" done={lease.agreement_paper_given} />
                <HandoverItem label="Police Verification" done={lease.police_verification_done} />
              </Col>
            </Row>
          </Card>

          {/* Documents Section */}
          {lease.documents?.length > 0 && (
            <Card className="border-0 shadow-sm rounded-4 p-4">
              <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem' }}>Attached Documents</h6>
              <div className="list-group list-group-flush">
                {lease.documents.map((doc: any) => (
                  <a key={doc.id} href={doc.file} target="_blank" rel="noreferrer" className="list-group-item list-group-item-action border-0 px-0 d-flex align-items-center">
                    <i className="bi bi-file-earmark-pdf text-danger fs-4 me-3"></i>
                    <div>
                      <div className="fw-bold small text-capitalize">{doc.doc_type} Paper</div>
                      <div className="x-small text-muted">Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                    </div>
                    <i className="bi bi-download ms-auto text-muted"></i>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </Col>

        {/* RIGHT COLUMN: BALANCE & QUICK STATS */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-dark text-white mb-4">
            <div className="opacity-75 small text-uppercase fw-bold mb-1">Current Balance</div>
            <h2 className="display-6 fw-bold mb-4">৳{Number(lease.current_balance).toLocaleString()}</h2>

            <div className="mb-3">
              <div className="opacity-50 small text-uppercase fw-bold">Security Deposit</div>
              <div className="h5 fw-bold">৳{Number(lease.security_deposit).toLocaleString()}</div>
              <Badge bg={lease.deposit_status === 'pending' ? 'warning' : 'success'} className="fw-normal">
                Deposit {lease.deposit_status}
              </Badge>
            </div>

            <hr className="opacity-25" />
            <p className="x-small opacity-50 mb-0">
                Created on {new Date(lease.created_at).toLocaleDateString()}
            </p>
          </Card>

          {/* Management Remarks */}
          {lease.remarks && (
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-info bg-opacity-10 border-start border-4 border-info">
                <h6 className="fw-bold text-info small text-uppercase">Management Remarks</h6>
                <p className="small text-dark mb-0 italic">"{lease.remarks}"</p>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}