import Layout from '../../components/layouts/Layout';
import InvoiceManager from "../../components/features/Invoices/InvoiceManager";
import {ADMIN_MENU_ITEMS} from "../../logic/utils/menuConstants";


export default function InvoicesPage() {
    return (
        <Layout menuItems={ADMIN_MENU_ITEMS}>


            <div className="container-fluid py-3 py-md-4">
                <InvoiceManager/>
            </div>


        </Layout>
    );
}