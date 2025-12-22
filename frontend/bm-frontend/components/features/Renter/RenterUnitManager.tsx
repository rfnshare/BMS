import { useEffect, useState, useMemo } from "react";
import { LeaseService } from "../../../logic/services/leaseService";
import { Spinner, Row, Col, Card, Badge, Container, Button } from "react-bootstrap";

export default function RenterUnitDetails() {
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResidency = async () => {
      try {
        const activeLease = await LeaseService.getMyActiveLease();
        setLease(activeLease);
      } catch (error) {
        console.error("Technical Audit Failure: Unit sync failed", error);
      } finally {
        setLoading(false);
      }
    };
    loadResidency();
  }, []);

  // 1. KPI DATA MAPPING (Blueprint Logic - Raw vs Display)
  const kpiStats = useMemo(() => {
    if (!lease) return [];
    return [
      { label: "Ledger Balance", display: `৳${Number(lease.current_balance).toLocaleString()}`, raw: Number(lease.current_balance), color: "danger", icon: "bi-wallet2" },
      { label: "Security Asset", display: `৳${Number(lease.security_deposit).toLocaleString()}`, raw: Number(lease.security_deposit), color: "primary", icon: "bi-shield-lock" },
      { label: "Monthly Commitment", display: `৳${Number(lease.rent_amount).toLocaleString()}`, raw: Number(lease.rent_amount), color: "success", icon: "bi-cash-coin" },
      { label: "Registry ID", display: `LS-${lease.id.toString().padStart(4, '0')}`, raw: lease.id, color: "dark", icon: "bi-hash" },
    ];
  }, [lease]);

  if (loading) return (
    <div className="text-center py-5 vstack gap-3 animate__animated animate__fadeIn">
      <Spinner animation="grow" variant="primary" size="sm" />
      <p className="text-muted fw-bold x-small text-uppercase ls-1">Retrieving Technical Specs...</p>
    </div>
  );

  if (!lease) return (
    <Container className="text-center py-5 animate__animated animate__fadeIn">
      <div className="card border-0 shadow-sm p-5 rounded-4 bg-white border-top border-4 border-warning">
        <i className="bi bi-exclamation-octagon text-warning display-4 mb-3"></i>
        <h5 className="fw-bold ls-1 text-uppercase">No Active Agreement</h5>
        <p className="text-muted small fw-bold ls-1 text-uppercase opacity-75">Verification required for unit data access.</p>
      </div>
    </Container>
  );

  return (
    <Container fluid className="animate__animated animate__fadeIn p-2 p-md-0 pb-5">

      {/* 2. INDUSTRIAL HEADER (Blueprint DNA) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
              <i className="bi bi-info-square fs-4"></i>
            </div>
            <div>
              <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Unit Specification</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">
                Technical Registry — Unit: {lease.unit_name} | Floor: {lease.floor_name || 'N/A'}
              </p>
            </div>
            <div className="ms-auto">
                <Badge pill bg="success" className="bg-opacity-10 text-success border border-success border-opacity-10 px-3 py-2 fw-bold ls-1 x-small">
                    {lease.status?.toUpperCase()} RESIDENCY
                </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TECHNICAL KPI OVERVIEW */}
      <Row className="g-2 g-md-3 mb-4">
        {kpiStats.map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
              </div>
              <div className={`h4 fw-bold mb-0 text-dark fs-5 fs-md-4 font-monospace`}>
                {s.display}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* 4. LEFT COLUMN: CORE SPECS & CHECKLIST */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <h6 className="fw-bold text-primary text-uppercase ls-1 mb-0">Financial Commitment</h6>
              <div className="text-muted x-small fw-bold ls-1">MOVE-IN: {new Date(lease.start_date).toLocaleDateString('en-GB')}</div>
            </div>

            <div className="bg-light rounded-4 p-3 mb-4 border border-dashed border-primary border-opacity-25">
              {lease.lease_rents?.map((item: any) => (
                <div key={item.id} className="d-flex justify-content-between mb-3">
                  <span className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>{item.rent_type_name}</span>
                  <span className="fw-bold text-dark font-monospace">৳{Number(item.amount).toLocaleString()}</span>
                </div>
              ))}
              <hr className="my-3 opacity-10" />
              <div className="d-flex justify-content-between text-primary fw-bold">
                <span className="ls-1 text-uppercase" style={{ fontSize: '0.75rem' }}>Aggregate Monthly Total</span>
                <span className="font-monospace h5 mb-0">৳{Number(lease.rent_amount).toLocaleString()}</span>
              </div>
            </div>

            <h6 className="fw-bold text-dark text-uppercase ls-1 mb-3" style={{ fontSize: '0.7rem' }}>Asset Handover Registry</h6>
            <Row className="g-2">
              {[
                { label: "Electricity", val: lease.electricity_card_given },
                { label: "Gas Card", val: lease.gas_card_given },
                { label: "Gate Key", val: lease.main_gate_key_given },
                { label: "Pocket Key", val: lease.pocket_gate_key_given },
                { label: "Agreement", val: lease.agreement_paper_given },
                { label: "Police Ver.", val: lease.police_verification_done },
              ].map((item, idx) => (
                <Col key={idx} xs={6} md={4}>
                    <div className={`p-3 rounded-4 border text-center h-100 transition-all ${item.val ? 'bg-success bg-opacity-10 border-success border-opacity-25 text-success' : 'bg-light text-muted border-light opacity-50'}`}>
                        <i className={`bi ${item.val ? 'bi-check-square-fill' : 'bi-dash-square'} fs-4 d-block mb-2`}></i>
                        <div style={{fontSize: '0.6rem'}} className="fw-bold text-uppercase ls-1">{item.label}</div>
                    </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* DOCUMENT AUDIT SECTION */}
          {lease.documents?.length > 0 && (
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-danger">
              <h6 className="fw-bold text-danger text-uppercase ls-1 mb-4 border-bottom pb-2">
                <i className="bi bi-shield-check me-2"></i>Legal Agreement Archive
              </h6>
              <div className="vstack gap-3">
                {lease.documents.map((doc: any) => (
                  <div key={doc.id} className="d-flex align-items-center p-3 bg-light rounded-4 border transition-all hover-bg-white cursor-pointer">
                    <div className="bg-danger bg-opacity-10 p-2 rounded-3 me-3 text-danger border border-danger border-opacity-10">
                        <i className="bi bi-file-earmark-pdf fs-5"></i>
                    </div>
                    <div className="overflow-hidden">
                      <div className="fw-bold small text-uppercase ls-1 text-dark text-truncate">{doc.doc_type} Agreement</div>
                      <div className="x-small text-muted fw-bold ls-1">ARCHIVED: {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                    </div>
                    <Button variant="white" className="ms-auto border rounded-circle p-2 shadow-sm" onClick={() => window.open(doc.file, '_blank')}>
                        <i className="bi bi-download text-primary"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>

        {/* 5. RIGHT COLUMN: REMARKS & BALANCE */}
        <Col lg={4}>
          <div className="vstack gap-4">
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-dark text-white border-top border-4 border-warning">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <div className="text-white text-opacity-50 x-small fw-bold text-uppercase ls-1">Financial Settlement</div>
                        <Badge pill bg={lease.deposit_status === 'paid' ? 'success' : 'warning'} className="mt-2 x-small ls-1 fw-bold border border-white border-opacity-10">
                            DEPOSIT: {lease.deposit_status?.toUpperCase()}
                        </Badge>
                    </div>
                    <i className="bi bi-activity text-warning fs-3 opacity-25"></i>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded-4 border border-secondary border-opacity-25 shadow-inner">
                    <div className="x-small text-white text-opacity-50 text-uppercase fw-bold mb-2 ls-1">Outstanding Registry</div>
                    <h2 className="fw-bold mb-0 font-monospace text-warning">৳{Number(lease.current_balance).toLocaleString()}</h2>
                </div>
            </Card>

            {/* Management Notes (Industrial Theme) */}
            {lease.remarks && (
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-info">
                  <h6 className="fw-bold text-info small text-uppercase ls-1 mb-2">
                    <i className="bi bi-info-circle me-2"></i>System Remarks
                  </h6>
                  <p className="small text-dark mb-0 fw-medium opacity-75">"{lease.remarks}"</p>
              </Card>
            )}

            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white text-center">
                 <div className="x-small text-muted fw-bold text-uppercase ls-1 mb-3">Unit Identity Protocol</div>
                 <div className="d-flex justify-content-center gap-2 mb-3">
                    <i className="bi bi-house-door text-primary fs-3"></i>
                    <i className="bi bi-qr-code-scan text-dark fs-3"></i>
                 </div>
                 <div className="small fw-bold text-dark font-monospace opacity-50">REG: {lease.id.toString().padStart(6, '0')}</div>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}