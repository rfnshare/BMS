import Layout from '../../components/layouts/Layout';
import RenterProfileManager from '../../components/features/Renter/RenterProfileManager';
import {RENTER_MENU_ITEMS} from "../../utils/menuConstants";

export default function RenterProfilePage() {
  return (
    <Layout menuItems={RENTER_MENU_ITEMS}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">

        <div className="mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h2 className="fw-bold text-dark mb-1">My Profile</h2>
            <p className="text-muted small m-0">Securely view and verify your residency identity data.</p>
          </div>
        </div>

        {/* REAL DATA LOGIC COMPONENT */}
        <RenterProfileManager />

        {/* DATA PRIVACY NOTE */}
        <div className="mt-4 p-3 rounded-4 bg-white border d-flex align-items-center gap-3 shadow-sm">
          <div className="bg-success bg-opacity-10 p-2 rounded-circle">
            <i className="bi bi-shield-lock-fill text-success"></i>
          </div>
          <span className="small text-muted">
            <strong>Security Notice:</strong> To update sensitive fields like your NID or Phone Number, please visit the building management office for identity verification.
          </span>
        </div>

      </div>
    </Layout>
  );
}