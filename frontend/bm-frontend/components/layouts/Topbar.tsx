import {Navbar, Container, Nav, NavDropdown, Badge, Spinner} from "react-bootstrap";
import {useRouter} from "next/router";
import {logout} from "../../utils/auth";
import {useEffect, useState} from "react";
import {ProfileService} from "../../logic/services/profileService";

// We still need this for the Image URL construction
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Topbar() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [detectedRole, setDetectedRole] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initData = async () => {
            try {
                // Step A: Fetch Profile
                const data = await ProfileService.getDetailedProfile();

                // Unwrap logic (if DRF returns { results: [...] })
                const profileData = data.results ? data.results[0] : data;
                setUserData(profileData);

                // Step B: Detect Role using the Service
                if (profileData?.email) {
                    await fetchRole(profileData.email);
                }
            } catch (err) {
                console.error("Topbar: Initialization failed", err);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, []);

    // 🔥 Refactored: Uses ProfileService instead of direct fetch
    // Inside Topbar.tsx
    const fetchRole = async (email: string) => {
        try {
            // 🔥 Clean and consistent!
            const result = await ProfileService.detectRole(email);

            if (result.role) {
                setDetectedRole(result.role.toLowerCase());
            }
        } catch (err) {
            console.error("Service Error:", err);
        }
    };

    const isRenter = detectedRole === "renter";

    // Resolve Image Path
    const getProfileImage = () => {
        if (!userData) return null;

        let path = null;

        // Logic: Renters use 'profile_pic', Admins use 'profile_picture'
        if (isRenter) {
            path = userData.profile_pic || userData.renter_profile?.profile_pic;
        } else {
            path = userData.profile_picture;
        }

        if (!path) return null;

        // Prepend API_URL for local development
        return path.startsWith('http') ? path : `${API_URL}${path}`;
    };

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    const userInitial = userData?.username ? userData.username.charAt(0).toUpperCase() : "?";
    const profileImageUrl = getProfileImage();

    // Name Display Logic
    const displayName = userData?.full_name || (userData?.first_name ? `${userData.first_name} ${userData.last_name}` : userData?.username);

    // Dynamic Links
    const profileLink = isRenter ? "/renter-dashboard/profile" : "/admin-dashboard/profile";
    const notificationLink = isRenter ? "/renter-dashboard/notifications" : "/admin-dashboard/notifications";

    return (
        <Navbar bg="white" expand="lg" className="border-bottom px-4 py-2 sticky-top shadow-sm"
                style={{height: '70px', zIndex: 1020}}>
            <Container fluid>
                {/* Left Side: Role Badge */}
                <div className="d-flex align-items-center">
                    <Badge
                        bg={isRenter ? "info" : "success"}
                        className="px-3 py-2 opacity-75 fw-bold text-uppercase rounded-pill shadow-sm"
                        style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}
                    >
                        {detectedRole || "Checking..."}
                    </Badge>
                </div>

                <Nav className="ms-auto align-items-center gap-3">
                    {/* Notification Trigger */}
                    <button
                        className="btn btn-light rounded-circle p-2 position-relative border shadow-sm"
                        onClick={() => router.push(notificationLink)}
                        title="Notifications"
                    >
                        <i className="bi bi-bell text-muted"></i>
                        {/* Optional Red Dot */}
                        {/* <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style={{ fontSize: '0.5rem' }}>!</span> */}
                    </button>

                    <div className="vr mx-2 opacity-25 d-none d-md-block" style={{height: '30px'}}></div>

                    <div className="d-flex align-items-center">
                        <div className="text-end me-3 d-none d-md-block">
                            <div className="fw-bold small text-dark lh-1 mb-1">{displayName || "Loading..."}</div>
                            <div className="text-muted text-uppercase fw-bold"
                                 style={{fontSize: '0.6rem'}}>{userData?.email}</div>
                        </div>

                        <NavDropdown
                            title={
                                <div className="position-relative">
                                    <div
                                        className={`rounded-circle border overflow-hidden d-flex align-items-center justify-content-center fw-bold text-white shadow-sm bg-gradient ${isRenter ? 'bg-info' : 'bg-primary'}`}
                                        style={{width: '42px', height: '42px', transition: 'all 0.3s ease'}}
                                    >
                                        {loading ? (
                                            <Spinner animation="border" size="sm"/>
                                        ) : profileImageUrl ? (
                                            <img
                                                src={profileImageUrl}
                                                alt="Avatar"
                                                className="w-100 h-100 object-fit-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span style={{fontSize: '1.2rem'}}>{userInitial}</span>
                                        )}
                                    </div>
                                    <span
                                        className="position-absolute bottom-0 end-0 p-1 border border-white rounded-circle bg-white shadow-sm"
                                        style={{width: '12px', height: '12px'}}>
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
                                <div className="text-muted truncate small"
                                     style={{maxWidth: '150px'}}>{userData?.username}</div>
                            </div>

                            <NavDropdown.Item onClick={() => router.push(profileLink)}>
                                <i className="bi bi-person-circle me-2 text-primary"></i>My Profile
                            </NavDropdown.Item>

                            {!isRenter && (
                                <NavDropdown.Item onClick={() => router.push("/admin-dashboard/reports")}>
                                    <i className="bi bi-shield-lock me-2 text-primary"></i>Admin Panel
                                </NavDropdown.Item>
                            )}

                            <NavDropdown.Divider/>
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