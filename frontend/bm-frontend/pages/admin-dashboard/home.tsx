import Layout from "../../components/layouts/Layout";
import AdminDashboard from "../../components/features/Admin/AdminDashboard";

export default function AdminHomePage() {
  return (
    <Layout>
      <div className="container-fluid p-0 animate__animated animate__fadeIn">
        {/* 🚀 All logic, headers, and data are now inside here */}
        <AdminDashboard />
      </div>
    </Layout>
  );
}