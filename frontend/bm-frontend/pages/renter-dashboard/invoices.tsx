import Layout from '../components/Layout';

const menuItems = [
  { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-house' },
  { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Payments', path: '/renter-dashboard/payments', icon: 'bi-credit-card' },
  { name: 'Profile', path: '/renter-dashboard/profile', icon: 'bi-person' },
];

export default function Page() {
  return (
    <Layout menuItems={menuItems}>
      <h1 className='h3 mb-3'>Placeholder Page</h1>
      <div className='p-3 bg-white rounded shadow-sm'>
        Content for C:\Users\afaroque\PycharmProjects\BM\frontend\bm-frontend\pages\renter-dashboard\invoices.tsx
      </div>
    </Layout>
  );
}
