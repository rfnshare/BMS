import Link from "next/link";
import { useRouter } from "next/router";
import { Nav } from "react-bootstrap";

interface SidebarProps {
    menuItems: { group: string; items: { name: string; path: string; icon: string }[] }[];
    show: boolean;   // 🔥 NEW
    onClose: () => void; // 🔥 NEW
}

export default function Sidebar({ menuItems, show, onClose }: SidebarProps) {
    const router = useRouter();

    return (
        <>
            {/* 🔥 MOBILE BACKDROP: Only visible when menu is open on mobile */}
            {show && (
                <div
                    className="offcanvas-backdrop fade show d-lg-none"
                    onClick={onClose}
                    style={{ zIndex: 1040 }}
                ></div>
            )}

            <div
                /* 🔥 FIXED: We manually toggle the 'show' class via logic */
                className={`offcanvas-lg offcanvas-start bg-dark text-white border-end ${show ? 'show' : ''}`}
                tabIndex={-1}
                id="sidebarMenu"
                style={{
                    width: "280px",
                    visibility: show ? 'visible' : undefined,
                    zIndex: 1050
                }}
            >
                <div className="offcanvas-header d-lg-none border-bottom border-secondary border-opacity-25 bg-dark">
                    <h5 className="offcanvas-title text-success fw-bold">BM PRO</h5>
                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={onClose}
                    ></button>
                </div>

                <div className="offcanvas-body d-flex flex-column p-0 vh-100">
                    <div className="p-4 d-none d-lg-flex align-items-center border-bottom border-secondary border-opacity-25" style={{ height: '70px' }}>
                        <span className="fw-bold fs-5 text-success tracking-tight">BM PRO</span>
                    </div>

                    <div className="flex-grow-1 overflow-auto py-3 px-3">
                        {menuItems?.map((section, sIdx) => (
                            <div key={sIdx} className="mb-4">
                                <div className="text-white-50 small fw-bold text-uppercase mb-2 px-2" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                    {section.group}
                                </div>
                                <Nav className="flex-column gap-1">
                                    {section.items.map((item) => {
                                        const isActive = router.pathname === item.path;
                                        return (
                                            <Nav.Item key={item.path}>
                                                <Link href={item.path} passHref legacyBehavior>
                                                    <Nav.Link
                                                        className={`rounded-3 px-3 py-2 d-flex align-items-center gap-3 transition-all ${
                                                            isActive ? "bg-success text-white shadow" : "text-white-50 hover-bg-dark-light"
                                                        }`}
                                                        onClick={onClose} // 🔥 Close on click
                                                    >
                                                        <i className={`bi ${item.icon} fs-5`}></i>
                                                        <span className="small fw-medium">{item.name}</span>
                                                    </Nav.Link>
                                                </Link>
                                            </Nav.Item>
                                        );
                                    })}
                                </Nav>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
                        <small className="text-white-50 d-block text-center">v2.5.0-2025</small>
                    </div>
                </div>
            </div>
        </>
    );
}