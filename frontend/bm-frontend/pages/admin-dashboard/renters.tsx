import Layout from "../../components/layouts/Layout";
import RenterManager from "../../components/features/Renters/RenterManager";

export default function RentersPage() {
  return (
    <Layout>
      <div className="container-fluid p-0 animate__animated animate__fadeIn">
        <RenterManager />
      </div>
    </Layout>
  );
}