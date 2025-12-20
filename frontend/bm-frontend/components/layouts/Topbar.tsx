import { Navbar, Container, Nav, NavDropdown, Badge, Image } from "react-bootstrap";
import { useRouter } from "next/router";
import { logout } from "../../utils/auth";

interface TopbarProps {
    user: any;
    onToggleMenu: () => void;
}

export default function Topbar({ user, onToggleMenu }: TopbarProps) {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    const isRenter = user?.role?.toLowerCase() === "renter";
    const profileImageUrl = user?.profile_pic || user?.profile_picture;
    const fullImgPath = profileImageUrl ? (profileImageUrl.startsWith('http') ? profileImageUrl : `${API_URL}${profileImageUrl}`) : null;

    return (
        <Navbar bg="white" className="border-bottom sticky-top shadow-sm px-0" style={{ height: '70px' }}>
            <Container fluid className="d-flex align-items-center justify-content-between px-3">

                {/* LEFT: TOGGLE & BRAND */}
                <div className="d-flex align-items-center">
                    <button
                        className="btn btn-light d-lg-none me-2 border shadow-sm"
                        type="button"
                        onClick={onToggleMenu}
                        aria-label="Toggle navigation"
                    >
                        <i className="bi bi-list fs-4"></i>
                    </button>

                    {/* Brand visible only on mobile (since Sidebar shows it on Desktop) */}
                    <Navbar.Brand className="d-lg-none fw-bold text-success mb-0">
                        BM <span className="text-dark">PRO</span>
                    </Navbar.Brand>
                </div>

                {/* RIGHT: USER INFO & DROPDOWN */}
                <Nav className="flex-row align-items-center">
                    {/* Username: Hidden on mobile to save space */}
                    <div className="d-none d-sm-block text-end me-3">
                        <div className="fw-bold small lh-1 mb-1 text-dark">
                            {user?.username || "Guest User"}
                        </div>
                        <Badge bg={isRenter ? "info" : "success"} className="rounded-pill" style={{ fontSize: '0.6rem' }}>
                            {user?.role?.toUpperCase() || "USER"}
                        </Badge>
                    </div>

                    {/* 🔥 FIXED DROPDOWN: Added custom toggle style to handle the click properly */}
                    <NavDropdown
                        align="end"
                        id="user-profile-dropdown"
                        title={
                            <div className="d-inline-block p-0 border-0 bg-transparent">
                                <div className="rounded-circle border border-2 border-white shadow-sm overflow-hidden d-flex align-items-center justify-content-center bg-primary text-white"
                                     style={{ width: '42px', height: '42px', cursor: 'pointer' }}>
                                    {fullImgPath ? (
                                        <Image
                                            src={fullImgPath}
                                            className="w-100 h-100 object-fit-cover"
                                            alt="profile"
                                        />
                                    ) : (
                                        <span className="fw-bold">{user?.username?.[0].toUpperCase() || "U"}</span>
                                    )}
                                </div>
                            </div>
                        }
                    >
                        <div className="px-3 py-2 d-sm-none border-bottom mb-2 bg-light">
                            <div className="fw-bold small text-dark">{user?.username}</div>
                            <small className="text-muted">{user?.role}</small>
                        </div>

                        <NavDropdown.Item onClick={() => router.push(isRenter ? "/renter-dashboard/profile" : "/admin-dashboard/profile")}>
                            <i className="bi bi-person me-2"></i> Profile
                        </NavDropdown.Item>

                        <NavDropdown.Divider />

                        <NavDropdown.Item
                            onClick={async () => { await logout(); router.push("/login"); }}
                            className="text-danger fw-bold"
                        >
                            <i className="bi bi-box-arrow-right me-2"></i> Logout
                        </NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Container>
        </Navbar>
    );
}