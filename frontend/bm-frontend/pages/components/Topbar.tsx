import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { useRouter } from "next/router";

export default function Topbar({ userName }: { userName: string }) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    // Redirect to login
    router.push("/login");
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm px-3">
      <Container fluid>
        <Navbar.Brand href="#" className="text-success fw-bold">
          BM Dashboard
        </Navbar.Brand>

        <Nav className="ms-auto">
          <NavDropdown title={userName} id="profile-dropdown" align="end">
            <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
            <NavDropdown.Item href="#">Settings</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
