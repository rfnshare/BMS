import Layout from '../../components/layouts/Layout';
import RenterInvoiceManager from '../../components/features/Renter/RenterInvoiceManager';
import RenterComplaintManager from "../../components/features/Renter/RenterComplaintManager";
import {RENTER_MENU_ITEMS} from "../../logic/utils/menuConstants";


export default function RenterComplaintsPage() {
  return (
    <Layout menuItems={RENTER_MENU_ITEMS}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">

        <RenterComplaintManager />
      </div>
    </Layout>
  );
}