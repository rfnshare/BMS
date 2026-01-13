import Layout from '../../components/layouts/Layout';
import RenterComplaintManager from "../../components/features/Renter/RenterComplaintManager";

export default function RenterComplaintsPage() {
  return (
    <Layout>
      <div className="container-fluid px-2 py-4 animate__animated animate__fadeIn">
        {/* HEADER SECTION */}
        <div className="mb-4 ps-2">
          <h2 className="fw-bold mb-1 text-dark h3">Support & Maintenance</h2>
          <p className="text-muted small">Submit requests for repairs or report issues with your unit.</p>
        </div>

        {/* The Logic Manager handles API data and the RenterComplaintModal */}
        <RenterComplaintManager />
      </div>
    </Layout>
  );
}