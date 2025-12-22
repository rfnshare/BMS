import Layout from '../../components/layouts/Layout';
import ProfileManager from "../../components/features/Profile/ProfileManager";
import {ADMIN_MENU_ITEMS} from "../../logic/utils/menuConstants";


export default function ProfilePage() {
  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
        <div className="container-fluid py-3 py-md-4">
        <ProfileManager />
        </div>
    </Layout>
  );
}