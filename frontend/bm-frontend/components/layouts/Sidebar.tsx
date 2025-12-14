import { useState } from "react";
import Link from "next/link";
import { Nav } from "react-bootstrap";

interface SidebarProps {
  items: { name: string; path: string; icon: string }[];
}

export default function Sidebar({ items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`bg-success text-white vh-100 d-flex flex-column p-2`}
      style={{ width: collapsed ? "60px" : "220px", transition: "width 0.3s" }}
    >
      <button
        className="btn btn-light mb-3"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "→" : "←"}
      </button>

      <Nav className="flex-column">
        {items.map((item) => (
          <Nav.Item key={item.path} className="mb-2">
            <Link href={item.path} passHref legacyBehavior>
              <Nav.Link className="text-white d-flex align-items-center">
                <i className={`bi ${item.icon} me-2`}></i>
                {!collapsed && item.name}
              </Nav.Link>
            </Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
}
