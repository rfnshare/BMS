import { useEffect, useState } from "react";
import { PermissionService } from "../../../logic/services/permissionService";
import api from "../../../logic/services/apiClient";
import PermissionModal from "./PermissionModal";

export default function PermissionManager() {
  const [rules, setRules] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<any>(null);

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

  const getAssignedUsernames = (userIds: number[]) => {
    if (!userIds || userIds.length === 0) return "Global (All)";
    return userIds
      .map(id => allStaff.find(u => u.id === id)?.username)
      .filter(Boolean)
      .join(", ");
  };

  const getActionBadge = (allowed: boolean, label: string) => (
    <span className={`badge rounded-pill me-1 ${allowed ? 'bg-success' : 'bg-light text-muted border'}`} style={{fontSize: '0.65rem'}}>
      {label}
    </span>
  );

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
      {/* RESPONSIVE HEADER */}
      <div className="card-header bg-white p-3 p-md-4 border-0">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-0">Security Policies</h5>
            <p className="text-muted small mb-0">Control module access for Managers and Renters.</p>
          </div>
          <button className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100 w-md-auto" onClick={() => setActiveModal({})}>
            <i className="bi bi-shield-lock me-2"></i>New Policy
          </button>
        </div>
      </div>

      {/* MOBILE LIST VIEW (Security Cards) */}
      <div className="d-block d-md-none">
        {rules.map(rule => (
          <div key={rule.id} className="p-3 border-bottom position-relative bg-white">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className={`badge rounded-pill ${rule.role === 'staff' ? 'bg-primary' : 'bg-info'}`}>
                {rule.role.toUpperCase()}
              </span>
              <div className="btn-group">
                <button className="btn btn-sm btn-light border py-1" onClick={() => setActiveModal(rule)}>
                  <i className="bi bi-pencil"></i>
                </button>
                <button className="btn btn-sm btn-light border text-danger py-1" onClick={async () => { if(confirm('Delete policy?')) { await PermissionService.destroy(rule.id); loadData(); } }}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <div className="mb-2">
              <div className="fw-bold text-dark h6 mb-0">{rule.app_label.toUpperCase()}</div>
              <div className="text-muted x-small">Resource: {rule.model_name}</div>
            </div>

            <div className="bg-light p-2 rounded-3 mb-2">
               <div className="text-muted x-small fw-bold mb-1">PERMISSIONS:</div>
               <div className="d-flex">
                  {getActionBadge(rule.can_create, 'CREATE')}
                  {getActionBadge(rule.can_read, 'READ')}
                  {getActionBadge(rule.can_update, 'UPDATE')}
                  {getActionBadge(rule.can_delete, 'DELETE')}
               </div>
            </div>

            <div className="text-muted" style={{fontSize: '0.75rem'}}>
              <i className="bi bi-people me-1"></i>
              {getAssignedUsernames(rule.assigned_to)}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="d-none d-md-block table-responsive">
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
                  <span className={`badge rounded-pill ${rule.role === 'staff' ? 'bg-primary' : 'bg-info'}`}>{rule.role.toUpperCase()}</span>
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
                  <div className="btn-group">
                    <button className="btn btn-sm btn-white border" onClick={() => setActiveModal(rule)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-white border text-danger" onClick={async () => { if(confirm('Delete policy?')) { await PermissionService.destroy(rule.id); loadData(); } }}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
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