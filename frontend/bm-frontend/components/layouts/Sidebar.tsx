import { useState } from "react";
import Link from "next/link";
import { Nav } from "react-bootstrap";
import { useRouter } from "next/router";

// 🔥 Matching the Grouped Structure
interface NavItem {
    name: string;
    path: string;
    icon: string;
}

interface NavGroup {
    group: string;
    items: NavItem[];
}

interface SidebarProps {
    menuItems: NavGroup[];
}

export default function Sidebar({ menuItems }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();

    return (
        <div
            className="bg-dark text-white vh-100 d-flex flex-column shadow"
            style={{
                width: collapsed ? "70px" : "250px",
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: 1000
            }}
        >
            {/* BRAND SECTION */}
            <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25" style={{ height: '70px' }}>
                {!collapsed && <span className="fw-bold fs-5 tracking-tight text-success animate__animated animate__fadeIn">BM PRO</span>}
                <button
                    className="btn btn-sm btn-outline-light border-0 opacity-75 mx-auto"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <i className={`bi ${collapsed ? "bi-list" : "bi-chevron-left"}`}></i>
                </button>
            </div>

            {/* NAVIGATION AREA */}
            <div className="flex-grow-1 overflow-auto py-3 px-2 custom-scrollbar">
                {menuItems?.map((section, sIdx) => (
                    <div key={sIdx} className="mb-4">

                        {/* SECTION HEADER: Only visible when expanded */}
                        {!collapsed && (
                            <div className="text-white-50 small fw-bold text-uppercase mb-2 px-3 animate__animated animate__fadeIn" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                {section.group}
                            </div>
                        )}

                        <Nav className="flex-column gap-1">
                            {section.items.map((item) => {
                                const isActive = router.pathname === item.path;
                                return (
                                    <Nav.Item key={item.path}>
                                        <Link href={item.path} passHref legacyBehavior>
                                            <Nav.Link
                                                className={`rounded-3 px-3 py-2 d-flex align-items-center transition-all ${
                                                    isActive
                                                        ? "bg-success text-white shadow-sm"
                                                        : "text-white-50 hover-bg-light-opacity"
                                                }`}
                                            >
                                                <i className={`bi ${item.icon} fs-5 ${collapsed ? "mx-auto" : "me-3"}`}></i>
                                                {!collapsed && <span className="small fw-medium animate__animated animate__fadeIn">{item.name}</span>}
                                            </Nav.Link>
                                        </Link>
                                    </Nav.Item>
                                );
                            })}
                        </Nav>

                        {/* Visual divider for collapsed mode */}
                        {collapsed && <hr className="border-secondary border-opacity-25 mx-2" />}
                    </div>
                ))}
            </div>

            {/* SIDEBAR FOOTER */}
            {!collapsed && (
                <div className="mt-auto p-3 border-top border-secondary border-opacity-25">
                    <div className="bg-secondary bg-opacity-10 p-2 rounded-3 text-center">
                        <small className="text-white-50">v2.5.0-2025</small>
                    </div>
                </div>
            )}
        </div>
    );
}