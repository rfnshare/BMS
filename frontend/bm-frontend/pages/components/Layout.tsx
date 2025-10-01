import {ReactNode, useEffect, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/router";
import {Navbar, Container, Nav, NavDropdown, Button} from "react-bootstrap";
import {getCurrentUser, isLoggedIn, logout} from "../../utils/auth";

interface MenuItem {
    name: string;
    path: string;
    icon: string; // Bootstrap icon class
}

interface LayoutProps {
    children: ReactNode;
    menuItems: MenuItem[];
}

export default function Layout({children, menuItems}: LayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [userName, setUserName] = useState("User");
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn()) {
            router.replace("/login");
        }
        (async () => {
            const user = await getCurrentUser();
            if (user) setUserName(user.username);
        })();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <div className="d-flex" style={{minHeight: "100vh"}}>
            {/* Sidebar */}
            <div
                className={`bg-success text-white d-flex flex-column p-3`}
                style={{
                    width: collapsed ? "60px" : "220px",
                    transition: "width 0.3s",
                }}
            >
                <div className="d-flex align-items-center justify-content-between mb-4">
                    {!collapsed && <h4 className="mb-0">BM Dashboard</h4>}
                    <Button
                        size="sm"
                        variant="light"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <i
                            className={`bi ${collapsed ? "bi-arrow-right" : "bi-arrow-left"}`}
                        ></i>
                    </Button>
                </div>

                <Nav className="flex-column">
                    {menuItems.map((item) => (
                        <Link key={item.path} href={item.path} passHref legacyBehavior>
                            <Nav.Link className="text-white d-flex align-items-center mb-2">
                                <i
                                    className={`bi ${item.icon} me-2`}
                                    style={{fontSize: "1.2rem"}}
                                ></i>
                                {!collapsed && <span>{item.name}</span>}
                            </Nav.Link>
                        </Link>
                    ))}
                </Nav>

            </div>

            {/* Main content */}
            <div className="flex-grow-1 d-flex flex-column">
                {/* Topbar */}
                <Navbar bg="white" expand="lg" className="shadow-sm">
                    <Container fluid className="justify-content-end">
                        <Nav className="ms-auto">
                            <NavDropdown title={userName} id="profile-dropdown" align="end">
                                <NavDropdown.Item onClick={() => router.push("/profile")}>
                                    Profile
                                </NavDropdown.Item>
                                <NavDropdown.Divider/>
                                <NavDropdown.Item onClick={handleLogout}>
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Container>
                </Navbar>

                {/* Page content */}
                <div className="flex-grow-1 p-4 bg-light">
                    {children}
                </div>
            </div>
        </div>
    );
}
