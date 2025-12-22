import { useState } from "react";
import { useComplaints } from "../../../logic/hooks/useComplaints";
import { ComplaintService } from "../../../logic/services/complaintService";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, InputGroup, Form, Row, Col } from "react-bootstrap";
import ComplaintModal from "./ComplaintModal";

export default function ComplaintManager() {
  const { success, error: notifyError } = useNotify(); // ✅ Professional Notifications

  const { data, loading, filters, setFilters, refresh } = useComplaints({
    status: "", priority: "", search: "", page: 1, ordering: "-priority"
  });

  const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'create' | null, data: any }>({ type: null, data: null });

  const handleDelete = async (id: number) => {
    if (window.confirm("⚠️ Resolve or Delete this ticket permanently?")) {
      try {
        await ComplaintService.destroy(id);
        success("Complaint ticket deleted."); // ✅ Professional Toast
        refresh();
      } catch (err) {
        notifyError("Failed to remove ticket.");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
        'pending': 'bg-warning-subtle text-warning border-warning',
        'in_progress': 'bg-primary-subtle text-primary border-primary',
        'resolved': 'bg-success-subtle text-success border-success',
        'closed': 'bg-secondary-subtle text-secondary border-secondary'
    };
    return map[status] || 'bg-light';
  };

  const getPriorityBadge = (prio: string) => {
    const map: any = {
        'low': 'bg-light text-muted',
        'medium': 'bg-info-subtle text-info',
        'high': 'bg-warning-subtle text-dark fw-bold',
        'critical': 'bg-danger text-white fw-bold animate__animated animate__pulse animate__infinite'
    };
    return map[prio] || 'bg-light';
  };

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. HEADER CARD (Blueprint Style) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1 text-dark">Maintenance & Complaints</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1">Ticketing & Issue Resolution</p>
            </div>
            <button
                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm py-2"
                onClick={() => setActiveModal({ type: 'create', data: null })}
            >
                <i className="bi bi-plus-lg me-2"></i>New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER SECTION */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
        <Row className="g-2">
            <Col xs={12} md={4}>
                <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                    <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                    <Form.Control
                        className="bg-light border-0"
                        placeholder="Search tickets..."
                        onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
                    />
                </InputGroup>
            </Col>
            <Col xs={6} md={4}>
                <Form.Select
                    size="sm" className="bg-light border-0 rounded-pill ps-3"
                    onChange={e => setFilters({...filters, priority: e.target.value, page: 1})}
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </Form.Select>
            </Col>
            <Col xs={6} md={4}>
                <Form.Select
                    size="sm" className="bg-light border-0 rounded-pill ps-3"
                    onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </Form.Select>
            </Col>
        </Row>
      </div>

      {/* 3. TABLE VIEW (Desktop) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white d-none d-md-block">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light border-bottom">
            <tr className="text-muted x-small fw-bold text-uppercase">
              <th className="ps-4 py-3">Ticket Info</th>
              <th>Unit / Renter</th>
              <th>Priority</th>
              <th>Status</th>
              <th className="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
            ) : data.results.map((c: any) => (
                <tr key={c.id}>
                    <td className="ps-4">
                        <div className="fw-bold small">{c.title}</div>
                        <div className="x-small text-muted">{new Date(c.created_at).toLocaleDateString()}</div>
                    </td>
                    <td>
                        <div className="fw-bold small text-primary">{c.unit_name || 'General'}</div>
                        <div className="text-muted x-small">{c.renter_name || 'Internal'}</div>
                    </td>
                    <td>
                        <Badge pill className={`border x-small ${getPriorityBadge(c.priority)}`}>
                            {c.priority.toUpperCase()}
                        </Badge>
                    </td>
                    <td>
                        <Badge pill className={`border x-small ${getStatusBadge(c.status)}`}>
                            {c.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </td>
                    <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                            <button className="btn btn-sm btn-white border-end" onClick={() => setActiveModal({type: 'edit', data: c})}><i className="bi bi-pencil-square text-primary"></i></button>
                            <button className="btn btn-sm btn-white text-danger" onClick={() => handleDelete(c.id)}><i className="bi bi-trash"></i></button>
                        </div>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. MOBILE VIEW & PAGINATION LOGIC REMAINS AS PER YOUR DESIGN... */}

      {/* MODAL */}
      {(activeModal.type === 'create' || activeModal.type === 'edit') && (
        <ComplaintModal
            complaint={activeModal.data}
            onClose={() => setActiveModal({type: null, data: null})}
            onSuccess={() => {
                success(activeModal.type === 'edit' ? "Ticket updated." : "New ticket created.");
                setActiveModal({type: null, data: null});
                refresh();
            }}
        />
      )}
    </div>
  );
}