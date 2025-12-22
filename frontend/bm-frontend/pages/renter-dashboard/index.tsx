import Layout from '../../components/layouts/Layout';
import RenterDashboard from '../../components/features/Renter/RenterDashboard';
import { withAuth } from '../../logic/utils/withAuth';
import {RENTER_MENU_ITEMS} from "../../logic/utils/menuConstants";


function RenterDashboardPage() {
  return (
    <Layout menuItems={RENTER_MENU_ITEMS}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* WELCOME HEADER */}
        <div className="mb-4 ps-1">
          <h2 className="fw-bold text-dark mb-1">Renter Portal</h2>
          <p className="text-muted small">Welcome back! Manage your stay and view your latest bills.</p>
        </div>

        {/* FEATURE COMPONENT */}
        {/* Clean Code Tip: Ensure RenterDashboard uses a custom hook for its data fetching! */}
        <RenterDashboard />

      </div>
    </Layout>
  );
}

// ✅ PROTECTED: Only allow users with the 'renter' role
export default withAuth(RenterDashboardPage, "renter");