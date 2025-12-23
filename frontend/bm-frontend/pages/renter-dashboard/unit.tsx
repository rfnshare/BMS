import Layout from '../../components/layouts/Layout';
import RenterUnitManager from '../../components/features/Renter/RenterUnitManager';
import RenterUnitDetails from "../../components/features/Renter/RenterUnitManager";
import {RENTER_MENU_ITEMS} from "../../utils/menuConstants";


export default function MyUnitPage() {
  return (
    <Layout menuItems={RENTER_MENU_ITEMS}>
      <div className="container-fluid py-4">
        <div className="mb-4">
          <h2 className="fw-bold mb-1">My Unit</h2>
          <p className="text-muted small">Overview of your current residency and lease terms.</p>
        </div>
        <RenterUnitDetails />
      </div>
    </Layout>
  );
}