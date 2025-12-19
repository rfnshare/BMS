import Layout from '../../components/layouts/Layout';
import RenterUnitManager from '../../components/features/Renter/RenterUnitManager';

// 🔥 STEP 1: Define the Grouped Menu for the Renter
// This must match the structure expected by your updated Sidebar.tsx
const renterMenuItems = [
  {
    group: "My Residence",
    items: [
      { name: 'Home', path: '/renter-dashboard', icon: 'bi-house-heart' },
      { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-building' },
    ]
  },
  {
    group: "Bills & History",
    items: [
      { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
      { name: 'Payment History', path: '/renter-dashboard/payments', icon: 'bi-credit-card-2-back' },
    ]
  },
  {
    group: "Communication",
    items: [
      { name: 'Notifications', path: '/renter-dashboard/notifications', icon: 'bi-bell' },
      // { name: 'Complaints', path: '/renter-dashboard/complaints', icon: 'bi-chat-left-dots' },
    ]
  },
  {
    group: "Settings",
    items: [
      { name: 'My Profile', path: '/renter-dashboard/profile', icon: 'bi-person-bounding-box' },
    ]
  },
];

export default function MyUnitsPage() {
  return (
    // 🔥 STEP 2: Pass 'renterMenuItems' to satisfy the Sidebar's nested mapping logic
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* PAGE HEADER */}
        <div className="mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h2 className="fw-bold text-dark mb-1">My Unit Details</h2>
            <p className="text-muted small mb-0">View technical specifications and amenities of your space.</p>
          </div>
          <div className="d-flex gap-2">
             <button className="btn btn-white border rounded-pill px-4 shadow-sm fw-bold small">
                <i className="bi bi-file-earmark-pdf me-2 text-danger"></i>Unit Manual
             </button>
          </div>
        </div>

        {/* LOGIC COMPONENT */}
        {/* RenterUnitManager handles the data fetch from /api/units/
            and specifically displays the unit linked to this renter's token. */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
             <RenterUnitManager />
        </div>

        {/* PROPERTY INFO BOX */}
        <div className="mt-4 p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex align-items-center gap-3 shadow-sm">
          <i className="bi bi-info-square-fill text-primary fs-5"></i>
          <span className="small text-primary-emphasis fw-medium">
            Standard maintenance is included in your rent. For emergency repairs (electrical/plumbing), please use the <strong>Notifications</strong> tab to reach the supervisor.
          </span>
        </div>

      </div>
    </Layout>
  );
}