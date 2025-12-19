import { Navbar, Container, Nav, NavDropdown, Badge } from "react-bootstrap";
import { useRouter } from "next/router";
import { logout } from "../../utils/auth";

// Define the shape of our user based on your API response
interface UserProfile {
  username: string;
  role: string;
  is_renter: boolean;
  is_superadmin: boolean;
  is_manager: boolean;
}

export default function Topbar({ user }: { user: UserProfile | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Logic: Format the role for display (e.g., "superadmin" -> "Super Admin")
  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')
    : "Loading...";

  return (
    <Navbar bg="white" expand="lg" className="border-bottom px-3 py-2" style={{ height: '70px' }}>
      <Container fluid>
        <div className="d-flex align-items-center">
           {/* Dynamic badge based on role */}
           <Badge
             bg={user?.is_renter ? "info" : "success"}
             className="ms-2 px-2 py-1 opacity-75 fw-normal text-capitalize"
           >
             {user?.is_renter ? "Verified Renter" : "Management Session"}
           </Badge>
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
              <div className="fw-bold small">{user?.username || "Loading..."}</div>
              {/* 🔥 DYNAMIC ROLE DISPLAY */}
              <div className={`fw-bold ${user?.is_renter ? 'text-info' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                {displayRole}
              </div>
            </div>

            <NavDropdown
              title={
                <div className="position-relative">
                  <img src="/avatar.png" className="rounded-circle border" width="35" height="35" alt="user" />
                  <span className={`position-absolute bottom-0 end-0 p-1 border border-white rounded-circle ${user?.is_renter ? 'bg-info' : 'bg-success'}`}></span>
                </div>
              }
              id="profile-dropdown"
              align="end"
            >
              <NavDropdown.Header className="small text-uppercase fw-bold text-muted">Account</NavDropdown.Header>

              {/* Dynamic Redirect: Renter vs Admin Profile */}
              <NavDropdown.Item onClick={() => router.push(user?.is_renter ? "/renter-dashboard/profile" : "/admin-dashboard/profile")}>
                <i className="bi bi-person me-2"></i>My Profile
              </NavDropdown.Item>

              <NavDropdown.Divider />

              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Sign Out
              </NavDropdown.Item>
            </NavDropdown>
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
}