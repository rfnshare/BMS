import { useState } from "react";
import { usePermissions } from "../../../logic/hooks/usePermissions";
import { PermissionService } from "../../../logic/services/permissionService";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, Button } from "react-bootstrap";
import PermissionModal from "./PermissionModal";

export default function PermissionManager() {
  const { success, error: notifyError } = useNotify();
  const { rules, allStaff, loading, refresh } = usePermissions();
  const [activeModal, setActiveModal] = useState<any>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm("⚠️ Remove this security policy? This may lock users out of the module.")) {
      try {
        await PermissionService.destroy(id);
        success("Security policy revoked.");
        refresh();
      } catch (err) {
        notifyError("Failed to delete policy.");
      }
    }
  };

  const getAssignedUsernames = (userIds: number[]) => {
    if (!userIds || userIds.length === 0) return "Global (All)";
    return userIds
      .map(id => allStaff.find(u => u.id === id)?.username)
      .filter(Boolean)
      .join(", ");
  };

  const getActionBadge = (allowed: boolean, label: string) => (
    <Badge pill className={`me-1 ${allowed ? 'bg-success-subtle text-success border-success' : 'bg-light text-muted border opacity-50'}`} style={{fontSize: '0.65rem'}}>
      {label}
    </Badge>
  );

  return (
    <div className="animate__animated animate__fadeIn">
      {/* 1. SECURITY HEADER */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-dark bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1 text-dark">Security Policies</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1">Role-Based Access Control (RBAC)</p>
            </div>
            <button className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm py-2" onClick={() => setActiveModal({})}>
              <i className="bi bi-shield-lock me-2"></i>New Policy
            </button>
          </div>
        </div>
      </div>

      {/* 2. DATA VIEW */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive d-none d-md-block">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light border-bottom">
              <tr className="text-muted x-small fw-bold text-uppercase ls-1">
                <th className="ps-4 py-3">Role Type</th>
                <th>Resource Module</th>
                <th>Assigned To</th>
                <th>Permissions</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="dark" size="sm" /></td></tr>
              ) : rules.map(rule => (
                <tr key={rule.id}>
                  <td className="ps-4">
                    <Badge bg={rule.role === 'staff' ? 'primary' : 'info'} className="rounded-pill px-3">
                        {rule.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <div className="fw-bold small">{rule.app_label.toUpperCase()}</div>
                    <div className="text-muted x-small font-monospace">{rule.model_name}</div>
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
                    <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                      <button className="btn btn-sm btn-white border-end" onClick={() => setActiveModal(rule)}><i className="bi bi-pencil-square text-primary"></i></button>
                      <button className="btn btn-sm btn-white text-danger" onClick={() => handleDelete(rule.id)}><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="d-block d-md-none bg-light-subtle">
            {rules.map(rule => (
              <div key={rule.id} className="p-3 border-bottom bg-white mb-2">
                <div className="d-flex justify-content-between mb-2">
                    <Badge bg={rule.role === 'staff' ? 'primary' : 'info'}>{rule.role.toUpperCase()}</Badge>
                    <div className="btn-group shadow-sm border rounded-pill overflow-hidden">
                        <button className="btn btn-white btn-sm px-3" onClick={() => setActiveModal(rule)}><i className="bi bi-pencil-square"></i></button>
                        <button className="btn btn-white btn-sm px-3 text-danger" onClick={() => handleDelete(rule.id)}><i className="bi bi-trash"></i></button>
                    </div>
                </div>
                <div className="fw-bold text-dark">{rule.app_label.toUpperCase()} <small className="text-muted fw-normal">({rule.model_name})</small></div>
                <div className="bg-light p-2 rounded-3 my-2 d-flex">
                    {getActionBadge(rule.can_create, 'CREATE')}
                    {getActionBadge(rule.can_read, 'READ')}
                    {getActionBadge(rule.can_update, 'UPDATE')}
                    {getActionBadge(rule.can_delete, 'DELETE')}
                </div>
                <div className="x-small text-muted"><i className="bi bi-people me-1"></i>{getAssignedUsernames(rule.assigned_to)}</div>
              </div>
            ))}
        </div>
      </div>

      {activeModal && (
        <PermissionModal
          rule={activeModal.id ? activeModal : null}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            success(activeModal.id ? "Policy updated." : "Security policy created.");
            setActiveModal(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}