import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuthContext } from "../../logic/context/AuthContext";
import {
  ADMIN_MENU_ITEMS,
  RENTER_MENU_ITEMS,
} from "../../utils/menuConstants";

// Interfaces for Type Safety
export interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, loading, isRenter } = useAuthContext();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();

  const menuItems: MenuGroup[] = isRenter ? RENTER_MENU_ITEMS : ADMIN_MENU_ITEMS;

  useEffect(() => {
    setShowMobileMenu(false);
  }, [router.pathname]);

  // 🛡️ SECURITY LAYER: Role-Based Authorization Guard
  useEffect(() => {
    if (!loading) {
      // Layer 1: Check if logged in
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      const path = router.pathname;

      // Layer 2: Renter trying to access Admin pages
      if (isRenter && path.startsWith("/admin-dashboard")) {
        console.error("Access Denied: Renters cannot access Admin Dashboard.");
        router.replace("/renter-dashboard");
        return;
      }

      // Layer 3: Admin trying to access Renter pages
      // (Admins usually view renter info via the Admin UI, not the Renter's personal dashboard)
      if (!isRenter && path.startsWith("/renter-dashboard")) {
        console.error("Redirecting: Admins should use the Admin Dashboard.");
        router.replace("/admin-dashboard/home");
        return;
      }
    }
  }, [isAuthenticated, loading, isRenter, router.pathname]);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  // Final Guard: If a redirect is happening, don't flash the unauthorized content
  const isAuthorized = () => {
    const path = router.pathname;
    if (isRenter && path.startsWith("/admin-dashboard")) return false;
    if (!isRenter && path.startsWith("/renter-dashboard")) return false;
    return true;
  };

  if (!isAuthorized()) return null;

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