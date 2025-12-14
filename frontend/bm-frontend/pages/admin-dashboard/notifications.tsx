import Layout from '../../components/layouts/Layout';

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

export default function Page() {
  return (
    <Layout menuItems={menuItems}>
      <h1 className='mb-4'>Placeholder Page</h1>
      <div className='p-4 bg-white rounded shadow-sm'>
        Content for C:\Users\afaroque\PycharmProjects\BM\frontend\bm-frontend\pages\admin-dashboard\notifications.tsx
      </div>
    </Layout>
  );
}
