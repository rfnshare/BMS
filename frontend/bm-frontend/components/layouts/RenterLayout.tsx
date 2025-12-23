import { ReactNode } from "react";
import Layout from "./Layout";
import {RENTER_MENU_ITEMS} from "../../utils/menuConstants";


export default function RenterLayout({ children }: { children: ReactNode }) {
  return (
    <Layout menuItems={RENTER_MENU_ITEMS}>
      {children}
    </Layout>
  );
}