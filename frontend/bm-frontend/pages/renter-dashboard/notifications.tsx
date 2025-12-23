import Layout from '../../components/layouts/Layout';
import RenterNotificationManager from "../../components/features/Renter/RenterNotificationManager";
import {RENTER_MENU_ITEMS} from "../../utils/menuConstants";


export default function RenterNotificationsPage() {
  return (
    <Layout menuItems={RENTER_MENU_ITEMS}>
      <div className="container-fluid py-4">
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Notifications</h2>
          <p className="text-muted small">View automated alerts regarding your rent, invoices, and building updates.</p>
        </div>
        <RenterNotificationManager />
      </div>
    </Layout>
  );
}