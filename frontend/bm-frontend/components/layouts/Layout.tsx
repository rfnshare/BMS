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

interface LayoutProps {
    children: ReactNode;
    menuItems: MenuItem[];
}

export default function Layout({ children, menuItems }: LayoutProps) {
    const [userName, setUserName] = useState("User");
    const router = useRouter();

    useEffect(() => {
        // Step 1: Secure the route
        if (!isLoggedIn()) {
            router.replace("/login");
            return;
        }

        // Step 2: Get user data
        (async () => {
            const user = await getCurrentUser();
            if (user) setUserName(user.username);
        })();
    }, [router]);

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* LEFT: Sidebar - Stays fixed to the viewport height */}
            <div className="sticky-top vh-100 shadow-sm" style={{ zIndex: 1020 }}>
                <Sidebar items={menuItems} />
            </div>

            {/* RIGHT: Content Area - Grows with the page content */}
            <div className="flex-grow-1 d-flex flex-column bg-body-tertiary">

                {/* Fixed Topbar - stays at the top of the content area */}
                <div className="sticky-top shadow-sm" style={{ zIndex: 1010 }}>
                    <Topbar userName={userName} />
                </div>

                {/* Dynamic Page Content */}
                {/* Changed: Removed fixed calc height. Used flex-grow to push footer down. */}
                <main className="p-4 flex-grow-1">
                    <div className="container-fluid p-0">
                        {children}
                    </div>
                </main>

                {/* Optional Footer */}
                <footer className="p-3 text-center text-muted small border-top bg-body">
                    &copy; 2025 BM Property Management System. All rights reserved.
                </footer>
            </div>
        </div>
    );
}