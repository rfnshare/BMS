import Layout from '../components/Layout';

const menuItems = [
  { name: 'Home', path: '/admin-dashboard/home', icon: 'bi-house' },
  { name: 'Units', path: '/admin-dashboard/units', icon: 'bi-grid' },
  { name: 'Renters', path: '/admin-dashboard/renters', icon: 'bi-people' },
  { name: 'Leases', path: '/admin-dashboard/leases', icon: 'bi-file-text' },
  { name: 'Invoices', path: '/admin-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Notifications', path: '/admin-dashboard/notifications', icon: 'bi-bell' },
  { name: 'Reports', path: '/admin-dashboard/reports', icon: 'bi-bar-chart' },
  { name: 'Profile', path: '/admin-dashboard/profile', icon: 'bi-person' },
];

export default function Page() {
  return (
    <Layout menuItems={menuItems}>
      <h1 className='h3 mb-3'>Placeholder Page</h1>
      <div className='p-3 bg-white rounded shadow-sm'>
        Content for C:\Users\afaroque\PycharmProjects\BM\frontend\bm-frontend\pages\admin-dashboard\invoices.tsx
      </div>
    </Layout>
  );
}
