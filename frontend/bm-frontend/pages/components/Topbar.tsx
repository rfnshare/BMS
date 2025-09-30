import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";

export default function Topbar() {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm px-3">
      <Container fluid>
        <Navbar.Brand href="#" className="text-success fw-bold">
          BM Dashboard
        </Navbar.Brand>

        <Nav className="ms-auto">
          <NavDropdown title="Admin" id="profile-dropdown" align="end">
            <NavDropdown.Item href="#">Profile</NavDropdown.Item>
            <NavDropdown.Item href="#">Settings</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#">Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
