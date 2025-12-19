import { useEffect, useState } from "react";
import { PermissionService } from "../../../logic/services/permissionService";
import api from "../../../logic/services/apiClient"; // Our updated client with refresh logic
import PermissionModal from "./PermissionModal";

export default function PermissionManager() {
  const [rules, setRules] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<any>(null);

  // Load both Rules and Staff List to map IDs to Names
  const loadData = async () => {
    try {
      const [rulesRes, staffRes] = await Promise.all([
        PermissionService.list(),
        api.get("/accounts/staff/")
      ]);
      setRules(rulesRes.results || []);
      setAllStaff(staffRes.data || []);
    } catch (err) {
      console.error("Error loading permission data", err);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Helper to find staff usernames for the table
  const getAssignedUsernames = (userIds: number[]) => {
    if (!userIds || userIds.length === 0) return "Global (All)";
    return userIds
      .map(id => allStaff.find(u => u.id === id)?.username)
      .filter(Boolean)
      .join(", ");
  };

  const getActionBadge = (allowed: boolean, label: string) => (
    <span className={`badge rounded-pill me-1 ${allowed ? 'bg-success' : 'bg-light text-muted'}`} style={{fontSize: '0.65rem'}}>
      {label}
    </span>
  );

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
      <div className="card-header bg-white p-4 d-flex justify-content-between align-items-center border-0">
        <div>
          <h5 className="fw-bold mb-0">Security Policies</h5>
          <p className="text-muted small mb-0">Control which modules Managers and Renters can access.</p>
        </div>
        <button className="btn btn-dark btn-sm rounded-pill px-4" onClick={() => setActiveModal({})}>
          <i className="bi bi-plus-lg me-2"></i>New Policy
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light x-small text-uppercase fw-bold text-muted">
            <tr>
              <th className="ps-4">Role</th>
              <th>Resource (Module)</th>
              <th>Assigned Users</th>
              <th>Perms</th>
              <th className="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id}>
                <td className="ps-4">
                  <span className={`badge ${rule.role === 'staff' ? 'bg-primary' : 'bg-info'}`}>{rule.role.toUpperCase()}</span>
                </td>
                <td>
                    <div className="fw-bold small">{rule.app_label.toUpperCase()}</div>
                    <div className="text-muted x-small">{rule.model_name}</div>
                </td>
                <td className="small text-truncate" style={{maxWidth: '200px'}}>
                  {getAssignedUsernames(rule.assigned_to)}
                </td>
                <td>
                  {getActionBadge(rule.can_create, 'C')}
                  {getActionBadge(rule.can_read, 'R')}
                  {getActionBadge(rule.can_update, 'U')}
                  {getActionBadge(rule.can_delete, 'D')}
                </td>
                <td className="text-end pe-4">
                  <button className="btn btn-sm btn-light border me-2" onClick={() => setActiveModal(rule)}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-light border text-danger" onClick={async () => { if(confirm('Delete policy?')) { await PermissionService.destroy(rule.id); loadData(); } }}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeModal && (
        <PermissionModal
          rule={activeModal.id ? activeModal : null}
          onClose={() => setActiveModal(null)}
          onSuccess={() => { setActiveModal(null); loadData(); }}
        />
      )}
    </div>
  );
}