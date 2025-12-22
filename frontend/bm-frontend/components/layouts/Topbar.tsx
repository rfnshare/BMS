import { Navbar, Container, Nav, NavDropdown, Badge, Image } from "react-bootstrap";
import { useRouter } from "next/router";
import { useAuthContext } from "../../logic/context/AuthContext"; // ✅ Context

export default function Topbar({ onToggleMenu }: { onToggleMenu: () => void }) {
    const { role, logout } = useAuthContext(); // ✅ Get user info from context
    const router = useRouter();

    const isRenter = role === "renter";

    const handleLogout = () => {
        logout(); // ✅ This handles storage clear AND redirection
    };

    return (
        <Navbar bg="white" className="border-bottom sticky-top shadow-sm px-0" style={{ height: '70px' }}>
            <Container fluid className="px-3">
                <div className="d-flex align-items-center">
                    <button className="btn btn-light d-lg-none me-2 border shadow-sm" onClick={onToggleMenu}>
                        <i className="bi bi-list fs-4"></i>
                    </button>
                    <Navbar.Brand className="d-lg-none fw-bold text-success mb-0">BM PRO</Navbar.Brand>
                </div>

                <Nav className="flex-row align-items-center">
                    <div className="d-none d-sm-block text-end me-3">
                        <Badge bg={isRenter ? "info" : "success"} className="rounded-pill text-uppercase">
                            {role}
                        </Badge>
                    </div>

                    <NavDropdown
                        align="end"
                        id="user-dropdown"
                        title={
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-person-fill"></i>
                            </div>
                        }
                    >
                        <NavDropdown.Item onClick={() => router.push(isRenter ? "/renter-dashboard/profile" : "/admin-dashboard/profile")}>
                            <i className="bi bi-person me-2"></i> Profile
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={handleLogout} className="text-danger fw-bold">
                            <i className="bi bi-box-arrow-right me-2"></i> Logout
                        </NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Container>
        </Navbar>
    );
}