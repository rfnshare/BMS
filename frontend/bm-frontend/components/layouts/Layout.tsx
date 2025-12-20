import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getCurrentUser, isLoggedIn } from "../../utils/auth";

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
    menuItems: MenuGroup[];
}

export default function Layout({ children, menuItems }: LayoutProps) {
    const [user, setUser] = useState<any>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false); // 🔥 NEW: State to control sidebar
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace("/login");
            return;
        }
        (async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (err) { console.error("Failed to fetch user"); }
        })();
    }, [router]);

    // 🔥 NEW: Close menu when clicking a link (on route change)
    useEffect(() => {
        setShowMobileMenu(false);
    }, [router.pathname]);

    return (
        <div className="d-flex w-100 min-vh-100">
            {/* 🔥 UPDATED: Pass state and close function */}
            <Sidebar
                menuItems={menuItems}
                show={showMobileMenu}
                onClose={() => setShowMobileMenu(false)}
            />

            <div className="flex-grow-1 d-flex flex-column bg-body-tertiary min-vw-0">
                {/* 🔥 UPDATED: Pass toggle function */}
                <Topbar user={user} onToggleMenu={() => setShowMobileMenu(true)} />

                <main className="p-3 p-md-4 flex-grow-1">
                    <div className="container-fluid p-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}