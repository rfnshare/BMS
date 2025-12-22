import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";

/**
 * withAuth HOC
 * @param Component The page component to protect
 * @param allowedRole Optional: 'staff' or 'renter'
 */
export const withAuth = (Component: any, allowedRole?: "staff" | "renter") => {
  return function ProtectedRoute(props: any) {
    const { isAuthenticated, role, loading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
      // 1. If not loading and not authenticated, kick to login
      if (!loading && !isAuthenticated) {
        router.replace("/login");
      }

      // 2. If authenticated but wrong role, kick to their correct home
      if (!loading && isAuthenticated && allowedRole && role !== allowedRole) {
        if (role === "staff") router.replace("/admin-dashboard");
        else router.replace("/renter-dashboard");
      }
    }, [isAuthenticated, role, loading, router]);

    // Show nothing (or a spinner) while checking status
    if (loading || !isAuthenticated) {
      return (
        <div className="vh-100 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      );
    }

    // If all checks pass, render the actual page
    return <Component {...props} />;
  };
};