import { useEffect, useState, useMemo } from "react";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Added Notifications
import { Spinner, Badge, Button, Row, Col, Table } from "react-bootstrap";
import RenterComplaintModal from "./RenterComplaintModal";

export default function RenterComplaintManager() {
  const { success, error: notifyError } = useNotify();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRenterModal, setShowRenterModal] = useState(false);

  // 1. INCIDENT KPI STATS (Resident Variant)
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      active: complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
      critical: complaints.filter(c => c.priority === 'critical' || c.priority === 'high').length
    };
  }, [complaints]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ComplaintService.list();
      setComplaints(res.results || []);
    } catch (err: any) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getStatusBadge = (status: string) => {
    const map: any = {
      'pending': 'bg-warning-subtle text-warning border-warning',
      'in_progress': 'bg-primary-subtle text-primary border-primary',
      'resolved': 'bg-success-subtle text-success border-success',
      'closed': 'bg-secondary-subtle text-secondary border-secondary'
    };
    return map[status] || 'bg-light text-muted border';
  };

  const getPriorityBadge = (prio: string) => {
    const map: any = {
      'low': 'bg-light text-muted border-light',
      'medium': 'bg-info-subtle text-info border-info',
      'high': 'bg-warning-subtle text-dark fw-bold border-warning',
      'critical': 'bg-danger text-white fw-bold border-danger animate__animated animate__pulse animate__infinite'
    };
    return map[prio] || 'bg-light';
  };

  return (
    <div className="animate__animated animate__fadeIn pb-5">

      {/* 2. INDUSTRIAL HEADER (Blueprint DNA) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
                <i className="bi bi-tools fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Maintenance Center</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Resident Incident Tracking & Support</p>
              </div>
            </div>
            <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
              <Button
                variant="primary"
                className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0 btn-sm ls-1"
                onClick={() => setShowRenterModal(true)}
              >
                <i className="bi bi-plus-lg"></i>
                <span>NEW REQUEST</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RESIDENT TICKET KPIs */}
      <Row className="g-2 g-md-3 mb-4">
        {[
          { label: "My Requests", val: stats.total, color: "primary", icon: "bi-clipboard-list" },
          { label: "Active/Pending", val: stats.active, color: "warning", icon: "bi-clock-history" },
          { label: "Urgent Priority", val: stats.critical, color: "danger", icon: "bi-exclamation-octagon" },
          { label: "Total Resolved", val: stats.resolved, color: "success", icon: "bi-check2-all" },
        ].map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
              </div>
              <div className={`h4 fw-bold mb-0 text-${s.color} fs-5 fs-md-4`}>
                {s.val.toString().padStart(2, '0')}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 4. DATA VIEW: INDUSTRIAL TABLE (Desktop) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3 d-none d-md-block">
        <Table hover className="align-middle mb-0">
          <thead className="bg-light border-bottom">
            <tr className="text-muted x-small fw-bold text-uppercase ls-1">
              <th className="ps-4 py-3">Incident Record</th>
              <th className="text-center">Severity</th>
              <th className="text-center">Lifecycle</th>
              <th>Dispatch Timestamp</th>
              <th className="pe-4 text-end">Audit</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
            ) : complaints.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-5 text-muted x-small fw-bold ls-1">NO ACTIVE MAINTENANCE RECORDS FOUND.</td></tr>
            ) : complaints.map(c => (
              <tr key={c.id}>
                <td className="ps-4">
                  <div className="fw-bold text-dark small">{c.title}</div>
                  {c.attachment && (
                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-10 x-small mt-1 ls-1 fw-bold" style={{fontSize: '0.55rem'}}>
                      <i className="bi bi-image me-1"></i>PHOTO ATTACHED
                    </Badge>
                  )}
                </td>
                <td className="text-center">
                  <Badge pill className={`border px-3 py-2 fw-bold text-uppercase ls-1 x-small ${getPriorityBadge(c.priority)}`}>
                    {c.priority}
                  </Badge>
                </td>
                <td className="text-center">
                  <Badge pill className={`border px-3 py-2 fw-bold text-uppercase ls-1 x-small ${getStatusBadge(c.status)}`}>
                    {c.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="small text-muted fw-bold ls-1 font-monospace">
                  {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="pe-4 text-end">
                    <Button variant="white" className="btn-sm rounded-pill border shadow-sm px-3 fw-bold x-small ls-1" title="View Details">
                      <i className="bi bi-eye text-primary"></i>
                    </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* 5. MOBILE VIEW: INCIDENT FEED */}
      <div className="d-block d-md-none vstack gap-2 p-2">
        {complaints.map(c => (
          <div key={c.id} className={`card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 ${c.priority === 'critical' ? 'border-danger' : 'border-primary'} animate__animated animate__fadeIn`}>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <Badge pill className={`x-small fw-bold ls-1 ${getPriorityBadge(c.priority)}`}>
                  {c.priority?.toUpperCase()}
                </Badge>
                <div className="x-small text-muted fw-bold font-monospace">#{c.id}</div>
            </div>

            <div className="fw-bold text-dark mb-1">{c.title}</div>

            <div className="d-flex justify-content-between align-items-end mt-3">
                <div className="x-small text-muted fw-bold ls-1">
                   <i className="bi bi-calendar-check me-1"></i>
                   {new Date(c.created_at).toLocaleDateString()}
                </div>
                <div className="text-end">
                    <Badge pill className={`x-small d-block mb-1 fw-bold ls-1 ${getStatusBadge(c.status)}`}>
                      {c.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Button variant="light" size="sm" className="rounded-pill border py-0 px-3 x-small fw-bold ls-1">DETAILS</Button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CONNECTION */}
      {showRenterModal && (
        <RenterComplaintModal
          onClose={() => setShowRenterModal(false)}
          onSuccess={() => {
            success("Incident Reported. Maintenance staff have been notified.");
            setShowRenterModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}