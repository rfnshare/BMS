import {useState, useEffect} from "react";
import {Navbar, Container, Nav, NavDropdown, Badge, Spinner} from "react-bootstrap";
import {useRouter} from "next/router";
import {useAuthContext} from "../../logic/context/AuthContext";
import {ProfileService} from "../../logic/services/profileService";

export default function Topbar({onToggleMenu}: { onToggleMenu: () => void }) {
    const {logout} = useAuthContext();
    const router = useRouter();

    // 1. IDENTITY STATE
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 2. DATA FETCHING (Using your Brain/Logic)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await ProfileService.getDetailedProfile();
                setProfile(data);
            } catch (err) {
                console.error("Identity Sync Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // 3. IMAGE URL HELPER
    // 3. IMAGE URL HELPER
    const getAvatarUrl = (path: string | null) => {
        if (!path) return null;

        // If it's already a full external URL, don't change it
        if (path.startsWith("http")) return path;

        /** * STEP 1: Get the API URL from your .env.local
         * Value: "http://192.168.1.7:8000/api"
         */
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

        /** * STEP 2: Strip the "/api" suffix
         * Result: "http://192.168.1.7:8000"
         */
        const baseUrl = apiUrl.replace(/\/api$/, "").replace(/\/api\/$/, "");

        /** * STEP 3: Clean the path
         * Ensures "/media/pic.jpg" and "media/pic.jpg" both work correctly
         */
        const cleanPath = path.startsWith("/") ? path : `/${path}`;

        return `${baseUrl}${cleanPath}`;
    };

    const isRenter = profile?.role?.toLowerCase() === "renter";
    const profilePath = isRenter ? "/renter-dashboard/profile" : "/admin-dashboard/profile";

    return (
        <Navbar
            bg="white"
            className="border-bottom sticky-top shadow-sm px-0 bg-white"
            style={{height: '70px', zIndex: 1030}}
        >
            <Container fluid className="px-3">
                {/* LEFT: MOBILE TRIGGER & BRANDING */}
                <div className="d-flex align-items-center">
                    <button
                        className="btn btn-light d-lg-none me-3 border shadow-sm rounded-3"
                        onClick={onToggleMenu}
                    >
                        <i className="bi bi-list fs-4"></i>
                    </button>
                    <Navbar.Brand
                        className="d-lg-none fw-bold text-primary mb-0 ls-1 text-uppercase"
                        style={{fontSize: '1.1rem'}}
                    >
                        BM PRO
                    </Navbar.Brand>
                </div>

                {/* RIGHT: USER IDENTITY STACK */}
                <Nav className="ms-auto flex-row align-items-center">

                    {/* SYSTEM LOGO/TIME (Optional context) */}
                    <div className="d-none d-md-flex flex-column text-end me-3 border-end pe-3">
                        {loading ? (
                            <Spinner animation="border" size="sm" variant="primary"/>
                        ) : (
                            <>
                                <span className="fw-bold text-dark small ls-1 text-uppercase">
                                    {profile?.first_name} {profile?.last_name}
                                </span>
                                <div className="d-flex align-items-center justify-content-end gap-2">
                                    <Badge
                                        pill
                                        bg={isRenter ? "info" : "primary"}
                                        className="bg-opacity-10 text-primary border border-primary border-opacity-10 x-small ls-1 fw-bold"
                                        style={{fontSize: '0.6rem'}}
                                    >
                                        {profile?.role?.toUpperCase()}
                                    </Badge>
                                </div>
                            </>
                        )}
                    </div>

                    {/* USER DROPDOWN & AVATAR */}
                    <NavDropdown
                        align="end"
                        id="user-dropdown"
                        title={
                            <div
                                className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm border border-2 border-white overflow-hidden"
                                style={{width: '45px', height: '45px'}}
                            >
                                {getAvatarUrl(profile?.profile_picture) ? (
                                    <img
                                        src={getAvatarUrl(profile?.profile_picture)!}
                                        alt="User"
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                ) : (
                                    <i className="bi bi-person-fill text-primary fs-5"></i>
                                )}
                            </div>
                        }
                    >
                        <div className="px-3 py-2 border-bottom d-md-none">
                            <div className="fw-bold small">{profile?.first_name}</div>
                            <Badge bg="primary" className="x-small text-uppercase">{profile?.role}</Badge>
                        </div>

                        <NavDropdown.Item
                            onClick={() => router.push(profilePath)}
                            className="py-2 small fw-bold text-muted ls-1"
                        >
                            <i className="bi bi-person-badge me-2 text-primary"></i>
                            MY PROFILE
                        </NavDropdown.Item>

                        <NavDropdown.Item
                            onClick={() => router.push(`${profilePath}?tab=security`)}
                            className="py-2 small fw-bold text-muted ls-1"
                        >
                            <i className="bi bi-shield-lock me-2 text-warning"></i>
                            SECURITY
                        </NavDropdown.Item>

                        <NavDropdown.Divider/>

                        <NavDropdown.Item
                            onClick={logout}
                            className="text-danger fw-bold py-2 small ls-1"
                        >
                            <i className="bi bi-power me-2"></i>
                            TERMINATE SESSION
                        </NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Container>
        </Navbar>
    );
}