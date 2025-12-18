import { useState } from "react";
import Link from "next/link";
import { Nav } from "react-bootstrap";
import { useRouter } from "next/router";

interface SidebarProps {
  items: { name: string; path: string; icon: string }[];
}

export default function Sidebar({ items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  return (
    <div
      className="bg-dark text-white vh-100 d-flex flex-column shadow"
      style={{
        width: collapsed ? "70px" : "250px",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 1000
      }}
    >
      {/* BRAND SECTION */}
      <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25" style={{ height: '70px' }}>
        {!collapsed && <span className="fw-bold fs-5 tracking-tight text-success">BM PRO</span>}
        <button
          className="btn btn-sm btn-outline-light border-0 opacity-75"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={`bi ${collapsed ? "bi-list" : "bi-chevron-left"}`}></i>
        </button>
      </div>

      {/* NAVIGATION */}
      <Nav className="flex-column p-2 mt-2 gap-1">
        {items.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <Nav.Item key={item.path}>
              <Link href={item.path} passHref legacyBehavior>
                <Nav.Link
                  className={`rounded-3 px-3 py-2 d-flex align-items-center transition-all ${
                    isActive
                      ? "bg-success text-white shadow-sm"
                      : "text-white-50 hover-bg-light-opacity"
                  }`}
                >
                  <i className={`bi ${item.icon} fs-5 ${collapsed ? "mx-auto" : "me-3"}`}></i>
                  {!collapsed && <span className="small fw-medium">{item.name}</span>}
                </Nav.Link>
              </Link>
            </Nav.Item>
          );
        })}
      </Nav>

      {/* SIDEBAR FOOTER */}
      {!collapsed && (
        <div className="mt-auto p-3 border-top border-secondary border-opacity-25">
          <div className="bg-secondary bg-opacity-10 p-2 rounded-3 text-center">
            <small className="text-white-50">v2.1.0-2025</small>
          </div>
        </div>
      )}
    </div>
  );
}