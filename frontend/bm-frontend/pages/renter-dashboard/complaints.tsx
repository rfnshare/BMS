import Layout from '../../components/layouts/Layout';
import RenterInvoiceManager from '../../components/features/Renter/RenterInvoiceManager';
import RenterComplaintManager from "../../components/features/Renter/RenterComplaintManager";

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

export default function RenterComplaintsPage() {
  return (
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <div className="mb-4 ps-2">
          <h2 className="fw-bold mb-1">Support & Maintenance</h2>
          <p className="text-muted small">Submit requests for repairs or report issues with your unit.</p>
        </div>
        <RenterComplaintManager />
      </div>
    </Layout>
  );
}