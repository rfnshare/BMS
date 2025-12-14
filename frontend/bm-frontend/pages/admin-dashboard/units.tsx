// pages/admin-dashboard/units.tsx
import Layout from '../../components/layouts/Layout';
import FloorManager from '../../components/features/Units/FloorManager';
import UnitManager from '../../components/features/Units/UnitManager';

const menuItems = [
  { name: 'Home', path: '/admin-dashboard/home', icon: 'bi-house' },
  { name: 'Units', path: '/admin-dashboard/units', icon: 'bi-building' },
  { name: 'Renters', path: '/admin-dashboard/renters', icon: 'bi-people' },
  { name: 'Leases', path: '/admin-dashboard/leases', icon: 'bi-file-text' },
  { name: 'Invoices', path: '/admin-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Notifications', path: '/admin-dashboard/notifications', icon: 'bi-bell' },
  { name: 'Reports', path: '/admin-dashboard/reports', icon: 'bi-bar-chart' },
  { name: 'Profile', path: '/admin-dashboard/profile', icon: 'bi-person' },
];

export default function UnitsPage() {
  return (
    <Layout menuItems={menuItems}>
      <h1 className="mb-4">Floor & Unit Management</h1>

      {/* FLOOR CRUD */}
      <div className="mb-5 p-4 bg-white rounded shadow-sm">
        <FloorManager />
      </div>

      {/* UNIT CRUD */}
      <div className="p-4 bg-white rounded shadow-sm">
        <UnitManager />
      </div>
    </Layout>
  );
}
