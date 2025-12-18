import Layout from '../../components/layouts/Layout';
import RenterDashboard from '../../components/features/Renter/RenterDashboard';

const menuItems = [
  { name: 'Home', path: '/renter-dashboard', icon: 'bi-house' },
  { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-building' },
  { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Payments', path: '/renter-dashboard/payments', icon: 'bi-wallet2' },
  { name: 'Profile', path: '/renter-dashboard/profile', icon: 'bi-person' },
];

export default function Page() {
  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-2">
        {/* Real Data Logic is here */}
        <RenterDashboard />
      </div>
    </Layout>
  );
}