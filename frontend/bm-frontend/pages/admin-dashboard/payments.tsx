import Layout from '../../components/layouts/Layout';
import PaymentManager from "../../components/features/Payments/PaymentManager";
import {ADMIN_MENU_ITEMS} from "../../utils/menuConstants";

export default function PaymentsPage() {
  return (
    <Layout>
      {/* The PaymentManager handles its own Headers, Filters, and Tables.
         We just provide the container with the fade-in animation.
      */}
      <div className="container-fluid p-0 animate__animated animate__fadeIn">
        <PaymentManager />
      </div>
    </Layout>
  );
}