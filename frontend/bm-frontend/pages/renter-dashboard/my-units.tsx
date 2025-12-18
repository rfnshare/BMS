import Layout from '../../components/layouts/Layout';
import RenterUnitManager from '../../components/features/Renter/RenterUnitManager';

const menuItems = [
  { name: 'Home', path: '/renter-dashboard', icon: 'bi-house' },
  { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-building' },
  { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Payments', path: '/renter-dashboard/payments', icon: 'bi-wallet2' },
  { name: 'Profile', path: '/renter-dashboard/profile', icon: 'bi-person' },
];

export default function MyUnitsPage() {
  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-4">

        {/* PAGE HEADER */}
        <div className="mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h2 className="fw-bold text-dark mb-1">My Unit</h2>
            <p className="text-muted mb-0">Detailed information about your currently occupied space.</p>
          </div>
          <button className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold">
            <i className="bi bi-file-earmark-pdf me-2"></i>Unit Guide
          </button>
        </div>

        {/* COMPONENT */}
        <RenterUnitManager />

      </div>
    </Layout>
  );
}