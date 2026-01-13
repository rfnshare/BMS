import Layout from '../../components/layouts/Layout';
import ExpenseManager from "../../components/features/Expenses/ExpenseManager";
import {ADMIN_MENU_ITEMS} from "../../utils/menuConstants";

export default function ExpensesPage() {
  return (
    <Layout>
      {/* The ExpenseManager handles its own header (title, summary stats),
        so we just need a clean container with the fade-in animation.
      */}
      <div className="container-fluid p-0 animate__animated animate__fadeIn">
        <ExpenseManager />
      </div>
    </Layout>
  );
}