import { useEffect, useState } from "react";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge, Button } from "react-bootstrap";
// 🔥 Import the new renter-specific modal
import RenterComplaintModal from "./RenterComplaintModal";

export default function RenterComplaintManager() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRenterModal, setShowRenterModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // The backend filters this to only show the logged-in renter's issues
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
      default: return 'warning'; // pending/open
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white">
      <div className="card-header bg-white p-4 d-flex justify-content-between align-items-center border-0">
        <div>
          <h5 className="fw-bold m-0">My Maintenance Requests</h5>
          <p className="text-muted small m-0">Track the status of your reported issues.</p>
        </div>
        <Button
          variant="primary"
          className="rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => setShowRenterModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>New Request
        </Button>
      </div>

      <div className="table-responsive p-3">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr className="text-muted small text-uppercase">
              <th className="ps-3 border-0">Issue Details</th>
              <th className="border-0">Priority</th>
              <th className="border-0">Status</th>
              <th className="border-0">Submitted</th>
              <th className="text-end pe-3 border-0">View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
            ) : complaints.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-5 text-muted">You haven't submitted any requests yet.</td></tr>
            ) : complaints.map(c => (
              <tr key={c.id}>
                <td className="ps-3">
                  <div className="fw-bold text-dark">{c.title}</div>
                  {c.attachment && (
                    <small className="text-primary d-block mt-1">
                      <i className="bi bi-image me-1"></i>Photo attached
                    </small>
                  )}
                </td>
                <td>
                  <span className={`small fw-bold text-uppercase ${c.priority === 'high' || c.priority === 'critical' ? 'text-danger' : 'text-muted'}`}>
                    {c.priority}
                  </span>
                </td>
                <td>
                  <Badge
                    bg={`${getStatusColor(c.status)}-subtle`}
                    text={getStatusColor(c.status)}
                    className="border rounded-pill text-capitalize px-3 fw-normal"
                  >
                    {c.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="small text-muted">
                  {new Date(c.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="text-end pe-3">
                  <Button variant="light" size="sm" className="rounded-circle border shadow-sm">
                    <i className="bi bi-eye"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 Separate Renter Modal */}
      {showRenterModal && (
        <RenterComplaintModal
          onClose={() => setShowRenterModal(false)}
          onSuccess={() => {
            setShowRenterModal(false);
            loadData(); // Refresh list after submission
          }}
        />
      )}
    </div>
  );
}