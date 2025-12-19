import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';

// 🔥 STEP 1: Define the Grouped Menu Items (Must match your Sidebar logic)
const adminMenuItems = [
  {
    group: "Operations",
    items: [
      { name: 'Dashboard', path: '/admin-dashboard', icon: 'bi-speedometer2' },
      { name: 'Units', path: '/admin-dashboard/units', icon: 'bi-building' },
      { name: 'Leases', path: '/admin-dashboard/leases', icon: 'bi-file-earmark-text' },
      { name: 'Renters', path: '/admin-dashboard/renters', icon: 'bi-people' },
    ]
  },
  {
    group: "Financials",
    items: [
      { name: 'Invoices', path: '/admin-dashboard/invoices', icon: 'bi-receipt' },
      { name: 'Payments', path: '/admin-dashboard/payments', icon: 'bi-wallet2' },
      { name: 'Expenses', path: '/admin-dashboard/expenses', icon: 'bi-cart-dash' },
    ]
  },
  {
    group: "Support & Intelligence",
    items: [
      { name: 'Complaints', path: '/admin-dashboard/complaints', icon: 'bi-exclamation-triangle' },
      { name: 'Notifications', path: '/admin-dashboard/notifications', icon: 'bi-bell' },
      { name: 'Reports', path: '/admin-dashboard/reports', icon: 'bi-bar-chart-line' },
    ]
  },
  {
    group: "System",
    items: [
      { name: 'Permissions', path: '/admin-dashboard/permissions', icon: 'bi-shield-lock' },
      { name: 'Profile', path: '/admin-dashboard/profile', icon: 'bi-person-gear' },
    ]
  },
];

export default function AdminDashboardIndex() {
  const router = useRouter();

  // Reusable Action Card
  const ActionCard = ({ title, icon, path, description, color }: any) => (
    <div className="col-md-6 col-lg-3 mb-4">
      <div
        className="card border-0 shadow-sm rounded-4 h-100 btn text-start p-0 overflow-hidden"
        onClick={() => router.push(path)}
        style={{ transition: 'all 0.3s ease' }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div className="card-body p-4">
          <div className={`rounded-4 bg-${color} bg-opacity-10 p-3 d-inline-block mb-3 text-${color}`}>
            <i className={`bi ${icon} fs-3`}></i>
          </div>
          <h5 className="fw-bold text-dark mb-1">{title}</h5>
          <p className="text-muted small mb-0">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout menuItems={adminMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* WELCOME SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold h2 mb-1">Control Center</h1>
            <p className="text-muted mb-0">Navigate through your property management modules.</p>
          </div>
          <div className="text-end d-none d-md-block">
            <div className="text-muted small text-uppercase fw-bold ls-1">System Status</div>
            <div className="badge bg-success-subtle text-success border border-success px-3">Live Sync Active</div>
          </div>
        </div>

        {/* PRIMARY MODULES GRID */}
        <div className="row">
          <ActionCard
            title="Units"
            icon="bi-building"
            path="/admin-dashboard/units"
            description="Manage rooms & availability."
            color="primary"
          />
          <ActionCard
            title="Leases"
            icon="bi-file-earmark-text"
            path="/admin-dashboard/leases"
            description="Active contracts & terms."
            color="info"
          />
          <ActionCard
            title="Renters"
            icon="bi-people"
            path="/admin-dashboard/renters"
            description="Tenant profiles & docs."
            color="success"
          />
          <ActionCard
            title="Invoices"
            icon="bi-receipt"
            path="/admin-dashboard/invoices"
            description="Billing & rent generation."
            color="warning"
          />
        </div>

        {/* SECONDARY MODULES GRID */}
        <div className="row mt-2">
          <ActionCard
            title="Expenses"
            icon="bi-cart-dash"
            path="/admin-dashboard/expenses"
            description="Track building costs."
            color="danger"
          />
          <ActionCard
            title="Complaints"
            icon="bi-chat-dots"
            path="/admin-dashboard/complaints"
            description="Manage service requests."
            color="secondary"
          />
          <ActionCard
            title="Reports"
            icon="bi-bar-chart-line"
            path="/admin-dashboard/reports"
            description="Analytics & data export."
            color="dark"
          />
          <ActionCard
            title="Permissions"
            icon="bi-shield-lock"
            path="/admin-dashboard/permissions"
            description="Role based access control."
            color="primary"
          />
        </div>

      </div>
    </Layout>
  );
}