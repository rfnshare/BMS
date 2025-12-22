import Layout from '../../components/layouts/Layout';
import PermissionManager from "../../components/features/Permission/PermissionManager";
import {ADMIN_MENU_ITEMS} from "../../logic/utils/menuConstants";

export default function PermissionsPage() {
  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-3 py-md-4">
        <PermissionManager />
      </div>
    </Layout>
  );
}