import Layout from '../components/Layout';

const menuItems = [
  { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-building' },
  { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Payments', path: '/renter-dashboard/payments', icon: 'bi-wallet2' },
  { name: 'Profile', path: '/renter-dashboard/profile', icon: 'bi-person' },
];

export default function Page() {
  return (
    <Layout menuItems={menuItems}>
      <h1 className='mb-4'>Placeholder Page</h1>
      <div className='p-4 bg-white rounded shadow-sm'>
        Content for C:\Users\afaroque\PycharmProjects\BM\frontend\bm-frontend\pages\renter-dashboard\profile.tsx
      </div>
    </Layout>
  );
}
