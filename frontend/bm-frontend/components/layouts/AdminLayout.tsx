import { ReactNode } from "react";
import Layout from "./Layout";
import {ADMIN_MENU_ITEMS} from "../../utils/menuConstants";


export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      {children}
    </Layout>
  );
}