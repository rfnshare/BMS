import { Navbar, Container, Nav, NavDropdown, Badge, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import { logout } from "../../utils/auth";
import { useEffect, useState } from "react";
import { ProfileService } from "../../logic/services/profileService";

export default function Topbar() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetching the "Detailed" profile because the standard 'user' prop
  // from Layout/Auth usually misses the 'profile_picture' field.
  const fetchDetailedInfo = async () => {
    try {
      const data = await ProfileService.getDetailedProfile();
      setUserData(data);
    } catch (err) {
      console.error("Topbar: Failed to fetch detailed profile for image", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailedInfo();
  }, []);

  // 2. Resolve the local Media URL
  const getFullUrl = (path: string | null | undefined): string => {
    if (!path) return "";
    // If it's already a full URL (production), use it; otherwise prepend local dev server
    return path.startsWith('http') ? path : `http://127.0.0.1:8000${path}`;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const userInitial = userData?.username ? userData.username.charAt(0).toUpperCase() : "?";

  return (
    <Navbar bg="white" expand="lg" className="border-bottom px-4 py-2 sticky-top shadow-sm" style={{ height: '70px', zIndex: 1020 }}>
      <Container fluid>
        {/* Left Side: Status Badge */}
        <div className="d-flex align-items-center">
           <Badge
             bg={userData?.role === 'Renter' ? "info" : "success"}
             className="px-3 py-2 opacity-75 fw-bold text-uppercase rounded-pill shadow-sm"
             style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
           >
             {userData?.role || "Checking Status..."}
           </Badge>
        </div>

        <Nav className="ms-auto align-items-center gap-3">
          {/* Notification Trigger */}
          <button
            className="btn btn-light rounded-circle p-2 position-relative border shadow-sm"
            onClick={() => router.push(userData?.role === 'Renter' ? "/renter-dashboard/notifications" : "/admin-dashboard/notifications")}
          >
            <i className="bi bi-bell text-muted"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style={{ fontSize: '0.5rem' }}>
              !
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="vr mx-2 opacity-25 d-none d-md-block" style={{ height: '30px' }}></div>

          {/* User Profile Section */}
          <div className="d-flex align-items-center">
            <div className="text-end me-3 d-none d-md-block">
              <div className="fw-bold small text-dark lh-1 mb-1">
                {userData?.first_name ? `${userData.first_name} ${userData.last_name}` : userData?.username || "..."}
              </div>
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>
                {userData?.email}
              </div>
            </div>

            <NavDropdown
              title={
                <div className="position-relative">
                  <div
                    className={`rounded-circle border overflow-hidden d-flex align-items-center justify-content-center fw-bold text-white shadow-sm bg-gradient ${userData?.role === 'Renter' ? 'bg-info' : 'bg-primary'}`}
                    style={{ width: '42px', height: '42px', transition: 'all 0.3s ease' }}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : userData?.profile_picture ? (
                      <img
                        src={getFullUrl(userData.profile_picture)}
                        alt="Avatar"
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '1.2rem' }}>{userInitial}</span>
                    )}
                  </div>
                  {/* Active Indicator */}
                  <span className="position-absolute bottom-0 end-0 p-1 border border-white rounded-circle bg-white shadow-sm" style={{ width: '12px', height: '12px' }}>
                    <div className="bg-success rounded-circle w-100 h-100"></div>
                  </span>
                </div>
              }
              id="profile-dropdown"
              align="end"
              className="no-caret"
            >
              <div className="px-3 py-2 bg-light border-bottom mb-2">
                <div className="fw-bold small text-dark">Signed in as</div>
                <div className="text-muted truncate small" style={{maxWidth: '150px'}}>{userData?.username}</div>
              </div>

              <NavDropdown.Item onClick={() => router.push(userData?.role === 'Renter' ? "/renter-dashboard/profile" : "/admin-dashboard/profile")}>
                <i className="bi bi-person-circle me-2 text-primary"></i>My Profile
              </NavDropdown.Item>

              {userData?.role !== 'Renter' && (
                <NavDropdown.Item onClick={() => router.push("/admin-dashboard/reports")}>
                  <i className="bi bi-shield-lock me-2 text-primary"></i>Admin Panel
                </NavDropdown.Item>
              )}

              <NavDropdown.Divider />

              <NavDropdown.Item onClick={handleLogout} className="text-danger fw-bold">
                <i className="bi bi-box-arrow-right me-2"></i>Sign Out
              </NavDropdown.Item>
            </NavDropdown>
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
}