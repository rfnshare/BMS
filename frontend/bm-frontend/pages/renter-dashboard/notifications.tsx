import Layout from '../../components/layouts/Layout';

const renterMenuItems = [
  { group: "My Residence", items: [
    { name: 'Home', path: '/renter-dashboard', icon: 'bi-house-heart' },
    { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-building' },
  ]},
  { group: "Bills & History", items: [
    { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
    { name: 'Payment History', path: '/renter-dashboard/payments', icon: 'bi-credit-card-2-back' },
  ]},
  { group: "Communication", items: [
    { name: 'Notifications', path: '/renter-dashboard/notifications', icon: 'bi-bell' },
  ]},
  { group: "Settings", items: [
    { name: 'My Profile', path: '/renter-dashboard/profile', icon: 'bi-person-bounding-box' },
  ]},
];

export default function RenterNotificationsPage() {
  return (
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <h2 className="fw-bold mb-1">Notifications</h2>
        <p className="text-muted small">Stay updated on building announcements and billing alerts.</p>
        <div className="card border-0 shadow-sm rounded-4 p-5 mt-4 text-center bg-white">
          <i className="bi bi-chat-dots display-4 text-primary opacity-25 mb-3"></i>
          <h5>You're all caught up!</h5>
          <p className="text-muted">Check back later for building announcements or maintenance schedules.</p>
        </div>
      </div>
    </Layout>
  );
}