import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { TokenService } from "../utils/token";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start as true
  const router = useRouter();

  const checkAuth = useCallback(() => {
    // 1. Double check we are in the browser
    if (typeof window !== "undefined") {
      const token = TokenService.getAccessToken();
      const storedRole = TokenService.getUserRole();

      if (token) {
        setIsAuthenticated(true);
        setRole(storedRole);
      }
    }
    // 2. IMPORTANT: Always set loading to false, even if no token is found
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (access: string, refresh: string, role: string) => {
    TokenService.setTokens(access, refresh, role);
    setIsAuthenticated(true);
    setRole(role);
    if (role === "staff") router.push("/admin-dashboard");
    else router.push("/renter-dashboard");
  };

  const logout = () => {
    TokenService.clear();
    setIsAuthenticated(false);
    setRole(null);
    router.push("/login");
  };

  return { isAuthenticated, role, loading, login, logout };
};