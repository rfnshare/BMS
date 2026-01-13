import { useEffect, useState } from "react";
import { LeaseService, Lease } from "../../../logic/services/leaseService";
import { UnitService } from "../../../logic/services/unitService";
import { Spinner, Row, Col, Card, Badge, Container, Nav } from "react-bootstrap";

// --- STEP 1: DEFINE TYPES (To fix @typescript-eslint/no-explicit-any) ---
interface UnitInfo {
  id: number;
  name: string;
  floor: string | number;
  floor_name?: string;
}

// --- HELPER 1: Individual Checklist Items ---
const HandoverItem = ({ label, done }: { label: string; done: boolean }) => (
  <div className="d-flex flex-column align-items-center p-2 rounded-3 border bg-white h-100 shadow-sm transition-all">
    <span className="text-muted mb-1" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</span>
    {done ? (
      <Badge bg="success-subtle" text="success" className="rounded-pill x-small border border-success">
        <i className="bi bi-check-circle-fill me-1"></i> Received
      </Badge>
    ) : (
      <Badge bg="light" text="muted" className="rounded-pill x-small border">
        <i className="bi bi-dash-circle me-1"></i> Pending
      </Badge>
    )}
  </div>
);

// --- HELPER 2: The Detailed Unit View ---
// ✅ Specified types instead of any
const LeaseDetailView = ({ lease, unitInfo }: { lease: Lease; unitInfo: UnitInfo | undefined }) => (
  <Row className="g-3 g-md-4 flex-column-reverse flex-lg-row animate__animated animate__fadeIn">
    {/* LEFT COLUMN: UNIT INFO & DOCUMENTS */}
    <Col lg={8}>
      <Card className="border-0 shadow-sm rounded-4 p-3 p-md-4 mb-3 bg-white">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <Badge bg="success" className="mb-2 px-3 rounded-pill text-uppercase" style={{ fontSize: '0.65rem' }}>
              {lease.status} residency
            </Badge>
            <h4 className="fw-bold text-dark">{unitInfo?.name || `Unit ${lease.unit}`}</h4>
            <div className="text-muted small">
              <i className="bi bi-layers me-1"></i> {unitInfo?.floor_name || `Floor ${unitInfo?.floor || 'N/A'}`}
            </div>
          </div>
          <div className="text-end">
            <div className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Move-in Date</div>
            <div className="fw-bold text-primary small">
              {lease.start_date ? new Date(lease.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Rent Breakdown */}
        <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Monthly Commitment</h6>
        <div className="bg-light rounded-4 p-3 mb-4">
          {(lease as any).lease_rents?.map((item: any) => (
            <div key={item.id} className="d-flex justify-content-between mb-2 small">
              <span className="text-secondary">{item.rent_type_name}</span>
              <span className="fw-bold text-dark">৳{Number(item.amount).toLocaleString()}</span>
            </div>
          ))}
          <hr className="my-2 opacity-10" />
          <div className="d-flex justify-content-between text-dark fw-bold">
            <span className="small">Total Rent</span>
            <span className="text-primary">৳{Number(lease.rent_amount).toLocaleString()}</span>
          </div>
        </div>

        {/* Handover Checklist */}
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
      {(lease as any).documents?.length > 0 && (
        <Card className="border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white">
          <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.7rem' }}>Unit Documents</h6>
          <div className="list-group list-group-flush">
            {(lease as any).documents.map((doc: any) => (
              <a key={doc.id} href={doc.file} target="_blank" rel="noreferrer" className="list-group-item list-group-item-action border-0 px-0 d-flex align-items-center py-2">
                <i className="bi bi-file-earmark-pdf text-danger fs-5 me-3"></i>
                <div className="small fw-bold text-capitalize">{doc.doc_type}</div>
                <i className="bi bi-download ms-auto text-primary"></i>
              </a>
            ))}
          </div>
        </Card>
      )}
    </Col>

    {/* RIGHT COLUMN: FINANCIAL STATUS */}
    <Col lg={4}>
      <Card className="border-0 shadow-sm rounded-4 p-4 bg-dark text-white mb-3">
        <div className="opacity-75 small text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem' }}>Current Dues</div>
        <h2 className="display-6 fw-bold mb-4 text-warning">৳{Number((lease as any).current_balance || 0).toLocaleString()}</h2>

        <div className="pt-3 border-top border-secondary border-opacity-50">
          <div className="opacity-50 small text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Security Deposit</div>
          <div className="h5 fw-bold mb-1">৳{Number(lease.security_deposit).toLocaleString()}</div>
          <Badge bg={lease.deposit_status === 'pending' ? 'warning' : 'success'} className="fw-bold x-small">
            {lease.deposit_status?.toUpperCase()}
          </Badge>
        </div>
      </Card>

      {lease.remarks && (
        <Card className="border-0 shadow-sm rounded-4 p-3 bg-info bg-opacity-10 border-start border-5 border-info">
          <h6 className="fw-bold text-info small text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Management Remarks</h6>
          {/* ✅ FIXED: Escaped entities for ESLint react/no-unescaped-entities */}
          <p className="small text-dark mb-0 italic">&ldquo;{lease.remarks}&rdquo;</p>
        </Card>
      )}
    </Col>
  </Row>
);

// --- MAIN COMPONENT ---
export default function RenterUnitDetails() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [activeLease, setActiveLease] = useState<Lease | null>(null);
  const [unitsMap, setUnitsMap] = useState<Record<number, UnitInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllResidencyData = async () => {
      try {
        const [leaseResults, unitResponse] = await Promise.all([
          LeaseService.getMyActiveLease(),
          UnitService.list()
        ]);

        const leaseData: Lease[] = Array.isArray(leaseResults) ? leaseResults : leaseResults.results || [];
        setLeases(leaseData);
        if (leaseData.length > 0) setActiveLease(leaseData[0]);

        const unitData: UnitInfo[] = Array.isArray(unitResponse) ? unitResponse : unitResponse.results || [];
        const map: Record<number, UnitInfo> = {};
        unitData.forEach((u) => { map[u.id] = u; });
        setUnitsMap(map);

      } catch (error) {
        console.error("Data Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllResidencyData();
  }, []);

  if (loading) return (
    <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted small fw-bold text-uppercase">Syncing Property Data...</p>
    </div>
  );

  if (leases.length === 0) return (
    <Container className="text-center py-5">
      <div className="card border-0 shadow-sm p-5 rounded-4 bg-white">
        <i className="bi bi-house-lock text-muted display-1 mb-3"></i>
        <h5 className="fw-bold">No Active Residency</h5>
        <p className="text-muted small">You are currently not assigned to any units in our system.</p>
      </div>
    </Container>
  );

  return (
    <Container fluid className="p-2 p-md-0 pb-5">
      {leases.length > 1 && (
        <div className="mb-4">
          <h6 className="fw-bold text-muted small text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>My Assigned Units</h6>
          <Nav variant="pills" className="gap-2 flex-nowrap overflow-auto pb-2 custom-scrollbar">
            {leases.map((l) => (
              <Nav.Item key={l.id}>
                <Nav.Link
                  active={activeLease?.id === l.id}
                  onClick={() => setActiveLease(l)}
                  className="rounded-pill px-4 fw-bold border py-2 shadow-sm text-nowrap"
                  style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  <i className={`bi bi-building${activeLease?.id === l.id ? '-fill' : ''} me-2`}></i>
                  {unitsMap[l.unit]?.name || `Unit ${l.unit}`}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>
      )}

      {activeLease && (
        <LeaseDetailView
          lease={activeLease}
          unitInfo={unitsMap[activeLease.unit]}
        />
      )}
    </Container>
  );
}