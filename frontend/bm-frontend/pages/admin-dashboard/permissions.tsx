import Layout from '../../components/layouts/Layout';
import PermissionManager from "../../components/features/Permission/PermissionManager";
import {ADMIN_MENU_ITEMS} from "../../logic/utils/menuConstants";

export default function PermissionsPage() {
  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Access Control</h2>
          <p className="text-muted small">Configure Role-Based Access Control (RBAC) for the building staff.</p>
        </div>

        <PermissionManager />
      </div>
    </Layout>
  );
}