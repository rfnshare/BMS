import Layout from '../../components/layouts/Layout';
import ComplaintManager from "../../components/features/Complaints/ComplaintManager";
import {ADMIN_MENU_ITEMS} from "../../utils/menuConstants";

export default function ComplaintsPage() {
  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid p-0 animate__animated animate__fadeIn">
        <ComplaintManager />
      </div>
    </Layout>
  );
}