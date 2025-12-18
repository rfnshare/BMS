import Layout from '../../components/layouts/Layout';
import RenterProfileManager from '../../components/features/Renter/RenterProfileManager';

const menuItems = [
  { name: 'Home', path: '/renter-dashboard', icon: 'bi-house' },
  { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-building' },
  { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Payments', path: '/renter-dashboard/payments', icon: 'bi-wallet2' },
  { name: 'Profile', path: '/renter-dashboard/profile', icon: 'bi-person' },
];

export default function RenterProfilePage() {
  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-4">

        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">My Profile</h2>
          <p className="text-muted mb-0">Manage your personal information and notification preferences.</p>
        </div>

        {/* REAL DATA LOGIC COMPONENT */}
        <RenterProfileManager />

        <div className="mt-4 p-3 rounded-4 bg-white border d-flex align-items-center gap-3 shadow-sm">
          <i className="bi bi-shield-check text-success fs-5"></i>
          <span className="small text-muted">
            Your data is protected. Only building administrators can see your contact and identity documents.
          </span>
        </div>

      </div>
    </Layout>
  );
}