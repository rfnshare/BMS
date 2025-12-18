import { Navbar, Container, Nav, NavDropdown, Badge } from "react-bootstrap";
import { useRouter } from "next/router";
import { logout } from "../../utils/auth";

export default function Topbar({ userName }: { userName: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom px-3 py-2" style={{ height: '70px' }}>
      <Container fluid>
        <div className="d-flex align-items-center">
           {/* Mobile menu toggle would go here */}
           <Badge bg="success" className="ms-2 px-2 py-1 opacity-75 fw-normal">Verified Session</Badge>
        </div>

        <Nav className="ms-auto align-items-center gap-3">
          {/* Notification Icon */}
          <button className="btn btn-light rounded-circle p-2 position-relative">
            <i className="bi bi-bell text-muted"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
              3
            </span>
          </button>

          {/* User Profile */}
          <div className="border-start ps-3 d-flex align-items-center">
            <div className="text-end me-2 d-none d-md-block">
              <div className="fw-bold small">{userName}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>Administrator</div>
            </div>
            <NavDropdown
              title={<img src="/avatar.png" className="rounded-circle border" width="35" height="35" alt="user" />}
              id="profile-dropdown"
              align="end"
              className="no-caret"
            >
              <NavDropdown.Header>My Account</NavDropdown.Header>
              <NavDropdown.Item onClick={() => router.push("/profile")}>
                <i className="bi bi-person me-2"></i>Profile
              </NavDropdown.Item>
              <NavDropdown.Item href="#">
                <i className="bi bi-gear me-2"></i>Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </NavDropdown.Item>
            </NavDropdown>
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
}