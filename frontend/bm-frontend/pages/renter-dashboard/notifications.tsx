import Layout from '../../components/layouts/Layout';
import RenterNotificationManager from "../../components/features/Renter/RenterNotificationManager";

export const renterMenuItems = [
  {
    group: "Home",
    items: [
      {
        name: 'Home',
        path: '/renter-dashboard',
        icon: 'bi-house-heart'
      },
      {
        name: 'My Unit',
        path: '/renter-dashboard/unit',
        icon: 'bi-building'
      },
    ]
  },
  {
    group: "Finance",
    items: [
      {
        name: 'Invoices',
        path: '/renter-dashboard/invoices',
        icon: 'bi-receipt'
      },
      {
        // 🔥 Added the Expenses link here
        name: 'Other Expenses',
        path: '/renter-dashboard/expenses',
        icon: 'bi-cart-check'
      },
      {
        name: 'Payments',
        path: '/renter-dashboard/payments',
        icon: 'bi-wallet2'
      },
    ]
  },
  {
    group: "Support",
    items: [
      {
        name: 'Complaints',
        path: '/renter-dashboard/complaints',
        icon: 'bi-exclamation-triangle'
      },
      {
        name: 'Notifications',
        path: '/renter-dashboard/notifications',
        icon: 'bi-bell'
      },
    ]
  },
  {
    group: "Settings",
    items: [
      {
        name: 'My Profile',
        path: '/renter-dashboard/profile',
        icon: 'bi-person-gear'
      },
    ]
  }
];

export default function RenterNotificationsPage() {
  return (
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-4">
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Notifications</h2>
          <p className="text-muted small">View automated alerts regarding your rent, invoices, and building updates.</p>
        </div>
        <RenterNotificationManager />
      </div>
    </Layout>
  );
}