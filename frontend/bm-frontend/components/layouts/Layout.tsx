import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getCurrentUser, isLoggedIn } from "../../utils/auth";

interface LayoutProps {
    children: ReactNode;
    menuItems: any[];
}

export default function Layout({ children, menuItems }: LayoutProps) {
    const [user, setUser] = useState<any>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
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

    useEffect(() => {
        setShowMobileMenu(false);
    }, [router.pathname]);

    return (
        /* 🔥 FIXED: Lock height to viewport to keep scrollbar internal */
        <div className="d-flex w-100 vh-100 overflow-hidden bg-body-tertiary">

            <Sidebar
                menuItems={menuItems}
                show={showMobileMenu}
                onClose={() => setShowMobileMenu(false)}
            />

            {/* 🔥 FIXED: Added min-width: 0 and overflow-y: auto
                This prevents the 'growing navbar' by containing the scroll
                inside this div only.
            */}
            <div className="flex-grow-1 d-flex flex-column min-vw-0 shadow-sm" style={{ minWidth: 0 }}>

                <Topbar user={user} onToggleMenu={() => setShowMobileMenu(true)} />

                <main className="flex-grow-1 overflow-y-auto overflow-x-hidden p-0">
                    <div className="container-fluid p-3 p-md-4">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}