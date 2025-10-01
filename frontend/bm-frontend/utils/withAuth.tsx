// utils/withAuth.tsx
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { getCurrentUser } from "./auth";

interface WithAuthProps {
  children: ReactNode;
  role?: string;
}

export default function withAuth<P>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) {
  return (props: P & WithAuthProps) => {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const user = await getCurrentUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        if (requiredRole && user.role !== requiredRole) {
          router.replace("/login");
        }
      };

      checkAuth();
    }, [router]);

    return <Component {...props} />;
  };
}
