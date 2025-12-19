import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getCurrentUser, isLoggedIn } from "../../utils/auth";

// 🔥 UPDATED: Interfaces to support groups
interface MenuItem {
    name: string;
    path: string;
    icon: string;
}

interface MenuGroup {
    group: string;
    items: MenuItem[];
}

interface LayoutProps {
    children: ReactNode;
    menuItems: MenuGroup[]; // Now expects an array of groups
}

// Inside components/layouts/Layout.tsx

export default function Layout({ children, menuItems }: LayoutProps) {
    const [user, setUser] = useState<any>(null); // 🔥 Store the full user object
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace("/login");
            return;
        }

        (async () => {
            try {
                // Assuming getCurrentUser calls your /api/accounts/me/ endpoint
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (err) {
                console.error("Failed to fetch user profile");
            }
        })();
    }, [router]);

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            <div className="sticky-top vh-100 shadow-sm" style={{ zIndex: 1020 }}>
                <Sidebar menuItems={menuItems} />
            </div>

            <div className="flex-grow-1 d-flex flex-column bg-body-tertiary">
                <div className="sticky-top shadow-sm" style={{ zIndex: 1010 }}>
                    {/* 🔥 Pass the whole user object to the Topbar */}
                    <Topbar user={user} />
                </div>

                <main className="p-4 flex-grow-1">{children}</main>
                {/* ... footer ... */}
            </div>
        </div>
    );
}