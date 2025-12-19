import { Navbar, Container, Nav, NavDropdown, Badge } from "react-bootstrap";
import { useRouter } from "next/router";
import { logout } from "../../utils/auth";

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

  // 🔥 Fix: Fallback for broken avatar
  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "?";

  return (
    <Navbar bg="white" expand="lg" className="border-bottom px-3 py-2 sticky-top" style={{ height: '70px', zIndex: 1020 }}>
      <Container fluid>
        <div className="d-flex align-items-center">
           <Badge
             bg={user?.is_renter ? "info" : "success"}
             className="ms-2 px-2 py-1 opacity-75 fw-normal text-capitalize shadow-sm"
           >
             {user?.is_renter ? "Verified Renter" : "Management Active"}
           </Badge>
        </div>

        <Nav className="ms-auto align-items-center gap-3">
          {/* 🔥 Fix: Notification button redirects to your new Notification Log */}
          <button
            className="btn btn-light rounded-circle p-2 position-relative border shadow-sm"
            onClick={() => router.push("/admin-dashboard/notifications")}
          >
            <i className="bi bi-bell text-muted"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
              !
            </span>
          </button>

          {/* User Profile Section */}
          <div className="border-start ps-3 d-flex align-items-center">
            <div className="text-end me-2 d-none d-md-block">
              <div className="fw-bold small text-dark">{user?.username || "Loading..."}</div>
              <div className={`fw-bold ${user?.is_renter ? 'text-info' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                {displayRole}
              </div>
            </div>

            <NavDropdown
              title={
                <div className="position-relative">
                  {/* 🔥 Fix: Replaced broken img with a dynamic initial circle */}
                  <div
                    className={`rounded-circle border d-flex align-items-center justify-content-center fw-bold text-white shadow-sm ${user?.is_renter ? 'bg-info' : 'bg-success'}`}
                    style={{ width: '38px', height: '38px', fontSize: '1rem' }}
                  >
                    {userInitial}
                  </div>
                  <span className="position-absolute bottom-0 end-0 p-1 border border-white rounded-circle bg-white" style={{ width: '10px', height: '10px' }}>
                    <div className="bg-success rounded-circle w-100 h-100"></div>
                  </span>
                </div>
              }
              id="profile-dropdown"
              align="end"
              className="no-caret"
            >
              <NavDropdown.Header className="small text-uppercase fw-bold text-muted px-3">
                {user?.role || 'User'} Account
              </NavDropdown.Header>

              <NavDropdown.Item onClick={() => router.push(user?.is_renter ? "/renter-dashboard/profile" : "/admin-dashboard/profile")}>
                <i className="bi bi-person-gear me-2"></i>My Profile
              </NavDropdown.Item>

              {/* Added: Quick link to reports for Managers/Admins */}
              {!user?.is_renter && (
                <NavDropdown.Item onClick={() => router.push("/admin-dashboard/reports")}>
                  <i className="bi bi-bar-chart-line me-2"></i>System Reports
                </NavDropdown.Item>
              )}

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