import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';

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

export default function AdminDashboardIndex() {
  const router = useRouter();

  // Reusable Quick Link Card component
  const ActionCard = ({ title, icon, path, description, color }: any) => (
    <div className="col-md-6 col-lg-3 mb-4">
      <div
        className="card border-0 shadow-sm rounded-4 h-100 btn text-start p-0 overflow-hidden transition-all"
        onClick={() => router.push(path)}
        style={{ transition: 'transform 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div className="card-body p-4">
          <div className={`rounded-3 bg-${color} bg-opacity-10 p-3 d-inline-block mb-3 text-${color}`}>
            <i className={`bi ${icon} fs-4`}></i>
          </div>
          <h5 className="fw-bold text-body">{title}</h5>
          <p className="text-muted small mb-0">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-2">

        {/* WELCOME SECTION */}
        <div className="row mb-5 align-items-center">
          <div className="col-md-8">
            <h1 className="fw-bold display-6 mb-2">System Overview</h1>
            <p className="text-muted fs-5">Manage your property, renters, and finances from one place.</p>
          </div>
          <div className="col-md-4 text-md-end">
            <div className="text-muted small">Current Date</div>
            <div className="fw-bold">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* PRIMARY ACTIONS GRID */}
        <div className="row">
          <ActionCard
            title="Units"
            icon="bi-building"
            path="/admin-dashboard/units"
            description="Manage floors and unit availability."
            color="primary"
          />
          <ActionCard
            title="Renters"
            icon="bi-people"
            path="/admin-dashboard/renters"
            description="View profiles and NID documents."
            color="success"
          />
          <ActionCard
            title="Invoices"
            icon="bi-receipt"
            path="/admin-dashboard/invoices"
            description="Generate and track monthly payments."
            color="warning"
          />
          <ActionCard
            title="Reports"
            icon="bi-bar-chart"
            path="/admin-dashboard/reports"
            description="Financial analytics and occupancy."
            color="info"
          />
        </div>

        {/* SYSTEM STATUS & LOGS */}
        <div className="row mt-4">
          <div className="col-lg-7 mb-4">
            <div className="card border-0 shadow-sm rounded-4 bg-body h-100">
              <div className="card-header bg-transparent border-0 pt-4 px-4">
                <h5 className="fw-bold">Occupancy Rate</h5>
              </div>
              <div className="card-body px-4 pb-4">
                <div className="progress mb-3" style={{ height: '12px' }}>
                  <div className="progress-bar bg-success rounded-pill" style={{ width: '85%' }}></div>
                </div>
                <div className="d-flex justify-content-between small text-muted">
                  <span>85% Occupied (102 Units)</span>
                  <span>15% Vacant (18 Units)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5 mb-4">
            <div className="card border-0 shadow-sm rounded-4 bg-body h-100">
              <div className="card-body p-4 d-flex align-items-center">
                <div className="me-4">
                  <i className="bi bi-shield-check text-success display-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-body">Security Check</h6>
                  <p className="small text-muted mb-0">Your system is up to date and all 124 renter documents are encrypted.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}