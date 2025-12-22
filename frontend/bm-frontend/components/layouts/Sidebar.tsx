import Link from "next/link";
import { useRouter } from "next/router";
import { Badge, Nav } from "react-bootstrap";

interface SidebarProps {
    menuItems: { group: string; items: { name: string; path: string; icon: string }[] }[];
    show: boolean;
    onClose: () => void;
}

export default function Sidebar({ menuItems, show, onClose }: SidebarProps) {
    const router = useRouter();

    return (
        <>
            {/* 1. MOBILE BACKDROP */}
            {show && (
                <div
                    className="offcanvas-backdrop fade show d-lg-none"
                    onClick={onClose}
                    style={{
                        zIndex: 1040,
                        backdropFilter: 'blur(4px)',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                ></div>
            )}

            {/* 2. MAIN SIDEBAR CONTAINER */}
            <div
                className={`offcanvas-lg offcanvas-start bg-dark text-white border-end border-secondary border-opacity-10 ${show ? 'show' : ''}`}
                tabIndex={-1}
                id="sidebarMenu"
                style={{
                    width: "280px",
                    visibility: show ? 'visible' : undefined,
                    zIndex: 1050,
                    transition: 'transform 0.3s ease-in-out'
                }}
            >
                {/* MOBILE HEADER */}
                <div className="offcanvas-header d-lg-none border-bottom border-secondary border-opacity-25 bg-dark p-4">
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-success p-1">
                            <i className="bi bi-building-fill text-white fs-5"></i>
                        </div>
                        <h5 className="offcanvas-title text-white fw-bold ls-1 text-uppercase mb-0">BM PRO</h5>
                    </div>
                    <button
                        type="button"
                        className="btn-close btn-close-white shadow-none"
                        onClick={onClose}
                    ></button>
                </div>

                <div className="offcanvas-body d-flex flex-column p-0 vh-100 shadow-lg">
                    {/* 3. DESKTOP BRANDING (Flush Blueprint) */}
                    <div className="p-4 d-none d-lg-flex align-items-center border-bottom border-secondary border-opacity-25 bg-dark" style={{ height: '70px' }}>
                         <div className="d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 p-2 text-success border border-success border-opacity-20">
                                <i className="bi bi-building-fill fs-5"></i>
                            </div>
                            <span className="fw-bold text-white text-uppercase ls-1" style={{ fontSize: '1.1rem' }}>
                                BM PRO
                            </span>
                        </div>
                    </div>

                    {/* 4. SCROLLABLE NAVIGATION FEED */}
                    <div className="flex-grow-1 overflow-auto py-4 px-0 custom-scrollbar">
                        {menuItems?.map((section, sIdx) => (
                            <div key={sIdx} className="mb-4">
                                <div className="text-white text-opacity-25 small fw-bold text-uppercase mb-2 px-4 ls-1" style={{ fontSize: '0.6rem' }}>
                                    {section.group}
                                </div>
                                <Nav className="flex-column">
                                    {section.items.map((item) => {
                                        const isActive = router.pathname === item.path;
                                        return (
                                            <Nav.Item key={item.path}>
                                                <Link href={item.path} passHref legacyBehavior>
                                                    <Nav.Link
                                                        className={`px-4 py-3 d-flex align-items-center gap-3 transition-all ls-1 border-start border-4 ${
                                                            isActive 
                                                            ? "bg-success bg-opacity-10 text-white fw-bold border-success" 
                                                            : "text-white text-opacity-50 hover-bg-dark-light fw-medium border-transparent"
                                                        }`}
                                                        onClick={onClose}
                                                        style={{ fontSize: '0.85rem' }}
                                                    >
                                                        <i className={`bi ${item.icon} ${isActive ? 'text-success' : 'text-white text-opacity-25'} fs-5`}></i>
                                                        <span>{item.name}</span>
                                                    </Nav.Link>
                                                </Link>
                                            </Nav.Item>
                                        );
                                    })}
                                </Nav>
                            </div>
                        ))}
                    </div>

                    {/* 5. FOOTER: REGISTRY STATUS */}
                    <div className="p-3 border-top border-secondary border-opacity-25 bg-dark bg-opacity-50">
                        <div className="d-flex flex-column align-items-center">
                            <Badge bg="dark" className="border border-secondary border-opacity-25 text-white-50 x-small px-3 py-2 rounded-pill fw-bold ls-1 mb-2">
                                v2.5.0-STABLE
                            </Badge>
                            <div className="text-white-50" style={{ fontSize: '0.6rem' }}>© 2025 BluePrint Operations</div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hover-bg-dark-light:hover {
                    background-color: rgba(255, 255, 255, 0.05);
                    color: white !important;
                }
                .transition-all {
                    transition: all 0.2s ease-in-out;
                }
                .ls-1 {
                    letter-spacing: 0.8px;
                }
                .border-transparent {
                    border-left-color: transparent !important;
                }
            `}</style>
        </>
    );
}