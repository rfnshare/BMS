import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';
import { withAuth } from '../../logic/utils/withAuth';
import {ADMIN_MENU_ITEMS} from "../../logic/utils/menuConstants";

function AdminDashboardIndex() {
  const router = useRouter();

  // Reusable Action Card (Purely Presentational)
  const ActionCard = ({ title, icon, path, description, color }: any) => (
    <div className="col-md-6 col-lg-3 mb-4">
      <div
        className="card border-0 shadow-sm rounded-4 h-100 btn text-start p-0 overflow-hidden"
        onClick={() => router.push(path)}
        style={{ transition: 'all 0.3s ease' }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-8px)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
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
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* WELCOME SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold h2 mb-1">Control Center</h1>
            <p className="text-muted mb-0">Navigate through building management modules.</p>
          </div>
          <div className="text-end d-none d-md-block">
            <div className="text-muted small text-uppercase fw-bold ls-1">System Status</div>
            <div className="badge bg-success-subtle text-success border border-success px-3">Live Sync Active</div>
          </div>
        </div>

        {/* MODULE GRID */}
        <div className="row">
          <ActionCard title="Units" icon="bi-building" path="/admin-dashboard/units" description="Rooms & availability." color="primary" />
          <ActionCard title="Leases" icon="bi-file-earmark-text" path="/admin-dashboard/leases" description="Active contracts." color="info" />
          <ActionCard title="Renters" icon="bi-people" path="/admin-dashboard/renters" description="Tenant profiles." color="success" />
          <ActionCard title="Invoices" icon="bi-receipt" path="/admin-dashboard/invoices" description="Billing & rent." color="warning" />
        </div>

        <div className="row mt-2">
          <ActionCard title="Expenses" icon="bi-cart-dash" path="/admin-dashboard/expenses" description="Track building costs." color="danger" />
          <ActionCard title="Complaints" icon="bi-chat-dots" path="/admin-dashboard/complaints" description="Service requests." color="secondary" />
          <ActionCard title="Reports" icon="bi-bar-chart-line" path="/admin-dashboard/reports" description="Data analytics." color="dark" />
          <ActionCard title="Permissions" icon="bi-shield-lock" path="/admin-dashboard/permissions" description="Access control." color="primary" />
        </div>

      </div>
    </Layout>
  );
}

// ✅ PROTECTED: Only allow 'staff' role
export default withAuth(AdminDashboardIndex, "staff");