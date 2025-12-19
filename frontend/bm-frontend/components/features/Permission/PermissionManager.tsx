import { useEffect, useState } from "react";
import { PermissionService } from "../../../logic/services/permissionService";
import PermissionModal from "./PermissionModal";

export default function PermissionManager() {
  const [rules, setRules] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<any>(null);

  const loadPermissions = async () => {
    const res = await PermissionService.list();
    setRules(res.results || []);
  };

  useEffect(() => { loadPermissions(); }, []);

  const getActionBadge = (allowed: boolean, label: string) => (
    <span className={`badge rounded-pill me-1 ${allowed ? 'bg-success' : 'bg-light text-muted'}`} style={{fontSize: '0.6rem'}}>
      {label}
    </span>
  );

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
      <div className="card-header bg-white p-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-0">Role-Based Access Control</h5>
          <p className="text-muted small mb-0">Define what Managers and Renters can do in the system.</p>
        </div>
        <button className="btn btn-dark btn-sm rounded-pill px-4" onClick={() => setActiveModal({})}>
          <i className="bi bi-plus-lg me-2"></i>Add Rule
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light x-small text-uppercase fw-bold text-muted">
            <tr>
              <th className="ps-4">Role</th>
              <th>Resource (App.Model)</th>
              <th>Permissions</th>
              <th className="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id}>
                <td className="ps-4">
                  <span className={`badge ${rule.role === 'staff' ? 'bg-primary' : 'bg-info'}`}>{rule.role.toUpperCase()}</span>
                </td>
                <td className="fw-bold small">{rule.app_label}.{rule.model_name}</td>
                <td>
                  {getActionBadge(rule.can_create, 'C')}
                  {getActionBadge(rule.can_read, 'R')}
                  {getActionBadge(rule.can_update, 'U')}
                  {getActionBadge(rule.can_delete, 'D')}
                </td>
                <td className="text-end pe-4">
                  <button className="btn btn-sm btn-light border me-2" onClick={() => setActiveModal(rule)}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-light border text-danger" onClick={async () => { if(confirm('Delete?')) { await PermissionService.destroy(rule.id); loadPermissions(); } }}><i className="bi bi-trash"></i></button>
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
          onSuccess={() => { setActiveModal(null); loadPermissions(); }}
        />
      )}
    </div>
  );
}