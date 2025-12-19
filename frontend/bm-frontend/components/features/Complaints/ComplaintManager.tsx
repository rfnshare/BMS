import { useEffect, useState } from "react";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import ComplaintModal from "./ComplaintModal";
import { Spinner } from "react-bootstrap";

export default function ComplaintManager() {
  const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
    page: 1,
    ordering: "-priority" // High priority first
  });

  const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'create' | null, data: any }>({ type: null, data: null });

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await ComplaintService.list(filters);
      setData(res);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaints(); }, [filters.status, filters.priority, filters.page, filters.search]);

  // 🔥 Feature: Delete
  const handleDelete = async (id: number) => {
    if (confirm("⚠️ Are you sure you want to delete this ticket?")) {
      try {
        await ComplaintService.destroy(id);
        loadComplaints();
      } catch (err: any) {
        alert(getErrorMessage(err));
      }
    }
  };

  // Helpers for Badges
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
    <div className="bg-white">
      {/* HEADER */}
      <div className="p-4 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h5 className="fw-bold text-dark m-0">Maintenance & Complaints</h5>
                <p className="text-muted small m-0">Track issues reported by renters.</p>
            </div>
            <button className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={() => setActiveModal({ type: 'create', data: null })}>
                <i className="bi bi-plus-lg me-2"></i>New Ticket
            </button>
        </div>

        {/* FILTERS */}
        <div className="d-flex gap-2 flex-wrap">
            <input
                type="text"
                className="form-control form-control-sm bg-light border-0 px-3 rounded-pill"
                placeholder="Search..."
                style={{width: '200px'}}
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
            />

            {/* 🔥 FIX: Changed 'px-3' to 'ps-3 pe-5' to fix arrow overlap */}
            <select
                className="form-select form-select-sm bg-light border-0 ps-3 pe-5 rounded-pill w-auto"
                value={filters.priority}
                onChange={e => setFilters({...filters, priority: e.target.value, page: 1})}
            >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
            </select>

            {/* 🔥 FIX: Changed 'px-3' to 'ps-3 pe-5' */}
            <select
                className="form-select form-select-sm bg-light border-0 ps-3 pe-5 rounded-pill w-auto"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
            >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
            </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
             <tr className="text-muted x-small fw-bold text-uppercase">
                <th className="ps-4">Ticket</th>
                <th>Unit / Renter</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th className="pe-4 text-end">Action</th>
             </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={6} className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
            ) : data.results.map((c: any) => (
                <tr key={c.id}>
                    <td className="ps-4">
                        <div className="fw-bold text-dark">{c.title}</div>
                        {c.attachment && (
                            <div className="x-small text-primary">
                                <i className="bi bi-paperclip me-1"></i>Has Attachment
                            </div>
                        )}
                    </td>
                    <td>
                        <div className="fw-bold small">{c.unit_name || c.unit_number || 'General'}</div>
                        <div className="text-muted x-small">{c.renter_name || 'No Renter'}</div>
                    </td>
                    <td>
                        <span className={`badge rounded-pill border ${getPriorityBadge(c.priority)}`}>
                            {c.priority.toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <span className={`badge rounded-pill border ${getStatusBadge(c.status)}`}>
                            {c.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </td>
                    <td className="small text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm rounded-3">
                            <button
                                className="btn btn-sm btn-white border-end"
                                title="Edit Ticket"
                                onClick={() => setActiveModal({type: 'edit', data: c})}
                            >
                                <i className="bi bi-pencil-square text-primary"></i>
                            </button>
                            {/* 🔥 Feature: Delete Button */}
                            <button
                                className="btn btn-sm btn-white text-danger"
                                title="Delete Ticket"
                                onClick={() => handleDelete(c.id)}
                            >
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 Feature: Pagination */}
      <div className="p-3 border-top d-flex justify-content-between align-items-center">
        <span className="text-muted x-small">Total Records: {data.count}</span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-light border rounded-pill px-3"
            disabled={!data.previous}
            onClick={() => setFilters({...filters, page: filters.page - 1})}
          >Prev</button>
          <button
            className="btn btn-sm btn-light border rounded-pill px-3"
            disabled={!data.next}
            onClick={() => setFilters({...filters, page: filters.page + 1})}
          >Next</button>
        </div>
      </div>

      {/* MODAL */}
      {(activeModal.type === 'create' || activeModal.type === 'edit') && (
        <ComplaintModal
            complaint={activeModal.data}
            onClose={() => setActiveModal({type: null, data: null})}
            onSuccess={() => {setActiveModal({type: null, data: null}); loadComplaints();}}
        />
      )}
    </div>
  );
}