import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuthContext } from "../../logic/context/AuthContext";
import {
  ADMIN_MENU_ITEMS,
  RENTER_MENU_ITEMS,
} from "../../utils/menuConstants";

interface LayoutProps {
  children: React.ReactNode;
  menuItems: MenuGroup[];
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, loading, isRenter } = useAuthContext();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();

  // 🔑 Role-based menu selection
  const menuItems = isRenter ? RENTER_MENU_ITEMS : ADMIN_MENU_ITEMS;

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [router.pathname]);

  // Handle unauthenticated access
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  return (
    <div className="d-flex w-100 vh-100 overflow-hidden bg-body-tertiary">
      <Sidebar
        menuItems={menuItems}
        show={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />

      <div className="flex-grow-1 d-flex flex-column min-vw-0 shadow-sm">
        <Topbar onToggleMenu={() => setShowMobileMenu(true)} />

        <main className="flex-grow-1 overflow-y-auto overflow-x-hidden">
          <div className="container-fluid p-3 p-md-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
