import { useRouter } from 'next/router';
import { withAuth } from '../../logic/utils/withAuth';
import { ADMIN_MENU_ITEMS } from "../../logic/utils/menuConstants";
import { useNotify } from "../../logic/context/NotificationContext"; // ✅ Global Notify
import Layout from '../../components/layouts/Layout';
import { Row, Col, Badge } from 'react-bootstrap';

function AdminDashboardIndex() {
  const router = useRouter();
  const { success } = useNotify(); // Ready for system announcements

  // 1. REUSABLE BLUEPRINT CARD
  const ActionCard = ({ title, icon, path, description, color }: any) => (
    <Col xs={12} md={6} lg={3} className="mb-3 mb-md-4">
      <div
        className={`card border-0 shadow-sm rounded-4 h-100 btn text-start p-0 overflow-hidden border-start border-4 border-${color} bg-white`}
        onClick={() => router.push(path)}
        style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 1rem 3rem rgba(0,0,0,.175)';
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div className="card-body p-4">
          <div className={`rounded-3 bg-${color} bg-opacity-10 p-2 d-inline-block mb-3 text-${color}`}>
            <i className={`bi ${icon} fs-4`}></i>
          </div>
          <h6 className="fw-bold text-dark mb-1 text-uppercase ls-1">{title}</h6>
          <p className="text-muted x-small mb-0 fw-medium" style={{ fontSize: '0.7rem' }}>{description}</p>
        </div>
      </div>
    </Col>
  );

  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* 2. HEADER CARD (Blueprint Style) */}
        <div className="card border-0 shadow-sm rounded-4 mb-5 border-start border-4 border-primary bg-white">
            <div className="card-body p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Control Center</h4>
                        <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1">
                           Central Building Management Systems
                        </p>
                    </div>
                    <div className="text-md-end">
                        <div className="text-muted x-small text-uppercase fw-bold ls-1 mb-1" style={{ fontSize: '0.6rem' }}>
                           System Integrity
                        </div>
                        <Badge pill className="bg-success-subtle text-success border border-success px-3 py-2 x-small">
                           <i className="bi bi-shield-check me-1"></i> LIVE SYNC ACTIVE
                        </Badge>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. MODULE GRID (Ordered by Operation flow) */}
        <h6 className="text-muted small fw-bold text-uppercase ls-1 mb-3 px-1">Primary Operations</h6>
        <Row className="g-3 mb-2">
          <ActionCard title="Units" icon="bi-building" path="/admin-dashboard/units" description="Property rooms & availability." color="primary" />
          <ActionCard title="Leases" icon="bi-file-earmark-text" path="/admin-dashboard/leases" description="Contract lifecycles & terms." color="info" />
          <ActionCard title="Renters" icon="bi-people" path="/admin-dashboard/renters" description="Tenant database & profiles." color="success" />
          <ActionCard title="Invoices" icon="bi-receipt" path="/admin-dashboard/invoices" description="Automated billing & rent." color="warning" />
        </Row>

        <h6 className="text-muted small fw-bold text-uppercase ls-1 mt-4 mb-3 px-1">Maintenance & Support</h6>
        <Row className="g-3">
          <ActionCard title="Expenses" icon="bi-cart-dash" path="/admin-dashboard/expenses" description="Track maintenance & costs." color="danger" />
          <ActionCard title="Complaints" icon="bi-chat-dots" path="/admin-dashboard/complaints" description="Tenant tickets & resolution." color="secondary" />
          <ActionCard title="Reports" icon="bi-bar-chart-line" path="/admin-dashboard/reports" description="Financial & occupancy data." color="dark" />
          <ActionCard title="Permissions" icon="bi-shield-lock" path="/admin-dashboard/permissions" description="System access & security." color="primary" />
        </Row>

      </div>
    </Layout>
  );
}

export default withAuth(AdminDashboardIndex, "staff");