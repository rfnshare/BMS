import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';
import ReportManager from "../../components/features/Reports/ReportManager";
import {ADMIN_MENU_ITEMS} from "../../utils/menuConstants";

export default function ReportsPage() {
  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid p-0 animate__animated animate__fadeIn">
        <ReportManager />
      </div>
    </Layout>
  );
}