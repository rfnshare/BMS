import Layout from "../../components/layouts/Layout";
import LeaseManager from "../../components/features/Leases/LeaseManager";

export default function LeasesPage() {
  return (
    <Layout>
      <div className="container-fluid p-0 animate__animated animate__fadeIn">
        <LeaseManager />
      </div>
    </Layout>
  );
}