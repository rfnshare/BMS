import { useState, useMemo } from "react";
import { usePermissions } from "../../../logic/hooks/usePermissions";
import { PermissionService } from "../../../logic/services/permissionService";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, Button, Row, Col } from "react-bootstrap";
import PermissionModal from "./PermissionModal";

export default function PermissionManager() {
  const { success, error: notifyError } = useNotify();
  const { rules, allStaff, loading, refresh } = usePermissions();
  const [activeModal, setActiveModal] = useState<any>(null);

  // 1. SECURITY KPI STATS (Blueprint Logic)
  const stats = useMemo(() => {
    return {
      activePolicies: rules.length || 0,
      staffCount: allStaff.length || 0,
      securedModules: new Set(rules.map(r => r.app_label)).size,
      globalRules: rules.filter(r => !r.assigned_to || r.assigned_to.length === 0).length
    };
  }, [rules, allStaff]);

  const handleDelete = async (id: number) => {
    if (window.confirm("⚠️ SECURITY AUDIT: Revoke this policy? This may immediately restrict user access.")) {
      try {
        await PermissionService.destroy(id);
        success("Security Policy Revoked.");
        refresh();
      } catch (err) {
        notifyError("Action Denied: Could not modify security ledger.");
      }
    }
  };

  const getAssignedUsernames = (userIds: number[]) => {
    if (!userIds || userIds.length === 0) return "Global (All Accounts)";
    return userIds
      .map(id => allStaff.find(u => u.id === id)?.username)
      .filter(Boolean)
      .join(", ");
  };

  const getActionBadge = (allowed: boolean, label: string) => (
    <Badge
      pill
      className={`me-1 fw-bold ls-1 ${allowed ? 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25' : 'bg-light text-muted border opacity-50'}`}
      style={{fontSize: '0.6rem'}}
    >
      {label}
    </Badge>
  );

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 2. INDUSTRIAL HEADER (Right-Aligned Actions) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-dark bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-dark bg-opacity-10 p-2 rounded-3 text-dark border border-dark border-opacity-10 d-none d-md-block">
                <i className="bi bi-shield-check fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Access Governance</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Role-Based Access Control (RBAC) Ledger</p>
              </div>
            </div>
            <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
              <Button
                variant="primary"
                className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0"
                onClick={() => setActiveModal({})}
              >
                <i className="bi bi-shield-lock-fill"></i>
                <span>NEW POLICY</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECURITY KPI OVERVIEW */}
      <Row className="g-2 g-md-3 mb-4">
        {[
          { label: "Active Policies", val: stats.activePolicies, color: "dark", icon: "bi-lock" },
          { label: "Staff Directory", val: stats.staffCount, color: "primary", icon: "bi-people" },
          { label: "Secured Modules", val: stats.securedModules, color: "info", icon: "bi-layers" },
          { label: "Global Rules", val: stats.globalRules, color: "warning", icon: "bi-globe" },
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
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-5">
        <div className="table-responsive d-none d-md-block">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light border-bottom">
              <tr className="text-muted x-small fw-bold text-uppercase ls-1">
                <th className="ps-4 py-3">Subject Role</th>
                <th>Resource Asset</th>
                <th>Entity Assignment</th>
                <th>Capability Matrix</th>
                <th className="pe-4 text-end">Audit</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
              ) : rules.map(rule => (
                <tr key={rule.id}>
                  <td className="ps-4">
                    <Badge pill bg={rule.role === 'staff' ? 'primary' : 'info'} className="px-3 py-2 fw-bold ls-1 x-small shadow-none border border-white border-opacity-25">
                        {rule.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <div className="fw-bold small text-dark">{rule.app_label.toUpperCase()}</div>
                    <div className="text-muted x-small fw-bold font-monospace opacity-75">{rule.model_name}</div>
                  </td>
                  <td className="small text-truncate" style={{maxWidth: '220px'}}>
                    <div className="fw-medium text-secondary">{getAssignedUsernames(rule.assigned_to)}</div>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                        {getActionBadge(rule.can_create, 'C')}
                        {getActionBadge(rule.can_read, 'R')}
                        {getActionBadge(rule.can_update, 'U')}
                        {getActionBadge(rule.can_delete, 'D')}
                    </div>
                  </td>
                  <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                      <Button variant="white" className="btn-sm border-end px-3" onClick={() => setActiveModal(rule)}><i className="bi bi-pencil-square text-warning"></i></Button>
                      <Button variant="white" className="btn-sm px-3 text-danger" onClick={() => handleDelete(rule.id)}><i className="bi bi-trash"></i></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. MOBILE VIEW: ACTION CARDS */}
        <div className="d-block d-md-none vstack gap-2 p-2 bg-light-subtle">
            {rules.map(rule => (
              <div key={rule.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge pill bg={rule.role === 'staff' ? 'primary' : 'info'} className="fw-bold ls-1 x-small px-3">{rule.role.toUpperCase()}</Badge>
                    <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                        <Button variant="white" className="btn-sm px-3" onClick={() => setActiveModal(rule)}><i className="bi bi-pencil-square text-warning"></i></Button>
                        <Button variant="white" className="btn-sm px-3 text-danger" onClick={() => handleDelete(rule.id)}><i className="bi bi-trash"></i></Button>
                    </div>
                </div>
                <div className="fw-bold text-dark mb-1 text-uppercase ls-1 small">{rule.app_label} — {rule.model_name}</div>
                <div className="bg-light p-2 rounded-3 my-2 d-flex gap-1">
                    {getActionBadge(rule.can_create, 'CREATE')}
                    {getActionBadge(rule.can_read, 'READ')}
                    {getActionBadge(rule.can_update, 'UPDATE')}
                    {getActionBadge(rule.can_delete, 'DELETE')}
                </div>
                <div className="x-small text-muted fw-bold ls-1 text-uppercase">
                    <i className="bi bi-people me-2 text-primary"></i>{getAssignedUsernames(rule.assigned_to)}
                </div>
              </div>
            ))}
        </div>
      </div>

      {activeModal && (
        <PermissionModal
          rule={activeModal.id ? activeModal : null}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}