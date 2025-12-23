import Layout from '../../components/layouts/Layout';
import RenterInvoiceManager from '../../components/features/Renter/RenterInvoiceManager';
import RenterComplaintManager from "../../components/features/Renter/RenterComplaintManager";
import {RENTER_MENU_ITEMS} from "../../utils/menuConstants";


export default function RenterComplaintsPage() {
  return (
    <Layout menuItems={RENTER_MENU_ITEMS}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <div className="mb-4 ps-2">
          <h2 className="fw-bold mb-1">Support & Maintenance</h2>
          <p className="text-muted small">Submit requests for repairs or report issues with your unit.</p>
        </div>
        <RenterComplaintManager />
      </div>
    </Layout>
  );
}