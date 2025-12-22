import Layout from "./Layout";
import {RENTER_MENU_ITEMS} from "../../logic/utils/menuConstants";

export default function RenterLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout menuItems={RENTER_MENU_ITEMS}>
            {children}
        </Layout>
    );
}