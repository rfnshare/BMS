import { useEffect, useState } from "react";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge, Button, Card } from "react-bootstrap";
import RenterComplaintModal from "./RenterComplaintModal";

export default function RenterComplaintManager() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRenterModal, setShowRenterModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ComplaintService.list();
      setComplaints(res.results || []);
    } catch (err: any) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'in_progress': return 'primary';
      case 'closed': return 'secondary';
      default: return 'warning';
    }
  };

  return (
    <div className="animate__animated animate__fadeIn">
      {/* 1. HEADER & ACTION BUTTON */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border mx-1">
        <div>
          <h5 className="fw-bold m-0 text-dark small text-uppercase" style={{ fontSize: '0.75rem' }}>Active Tickets</h5>
          <div className="h4 fw-bold mb-0 text-primary">{complaints.length.toString().padStart(2, '0')}</div>
        </div>
        <Button
          variant="primary"
          className="rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => setShowRenterModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>New Request
        </Button>
      </div>

      {/* 2. MAIN LISTING AREA */}
      <div className="px-1">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : complaints.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <i className="bi bi-chat-left-dots fs-1 text-muted opacity-25 mb-3"></i>
            <div className="text-muted">You haven't submitted any requests yet.</div>
          </Card>
        ) : (
          <>
            {/* MOBILE VIEW: List Cards */}
            <div className="d-md-none vstack gap-2">
              {complaints.map(c => (
                <Card key={c.id} className="border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4" style={{ borderLeftColor: `var(--bs-${getStatusColor(c.status)})` }}>
                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <div className="min-vw-0">
                      <div className="fw-bold text-dark small text-truncate">{c.title}</div>
                      <div className="text-muted x-small mt-1">
                        <i className="bi bi-calendar-event me-1"></i>
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge
                      bg={`${getStatusColor(c.status)}-subtle`}
                      text={getStatusColor(c.status)}
                      className="rounded-pill x-small text-uppercase border flex-shrink-0"
                    >
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className={`x-small fw-bold text-uppercase ${c.priority === 'high' || c.priority === 'critical' ? 'text-danger' : 'text-muted'}`}>
                        {c.priority} Priority
                      </span>
                      {c.attachment && <i className="bi bi-image text-primary small"></i>}
                    </div>
                    <Button variant="light" size="sm" className="rounded-pill border px-3 x-small fw-bold">
                      Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* DESKTOP VIEW: Legacy Table */}
            <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light small text-muted text-uppercase">
                    <tr>
                      <th className="ps-4 py-3">Issue Details</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th className="pe-4 text-end">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id}>
                        <td className="ps-4">
                          <div className="fw-bold text-dark small">{c.title}</div>
                          {c.attachment && <small className="text-primary x-small fw-bold"><i className="bi bi-paperclip me-1"></i>Attachment</small>}
                        </td>
                        <td>
                          <span className={`small fw-bold text-uppercase ${c.priority === 'high' || c.priority === 'critical' ? 'text-danger' : 'text-muted'}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td>
                          <Badge bg={`${getStatusColor(c.status)}-subtle`} text={getStatusColor(c.status)} className="border rounded-pill text-capitalize px-3 fw-normal">
                            {c.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="small text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="pe-4 text-end">
                          <Button variant="light" size="sm" className="rounded-circle border shadow-sm">
                            <i className="bi bi-eye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showRenterModal && (
        <RenterComplaintModal
          onClose={() => setShowRenterModal(false)}
          onSuccess={() => {
            setShowRenterModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}