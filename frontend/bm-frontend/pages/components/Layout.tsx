// components/Layout.tsx
import { ReactNode, useState } from "react";
import Link from "next/link";

interface MenuItem {
  name: string;
  path: string;
  icon: string; // Bootstrap icon class
}

interface LayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
  userName: string;
}

export default function Layout({ children, menuItems, userName }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className={`bg-success text-white p-3 d-flex flex-column ${
          collapsed ? "collapsed" : ""
        }`}
        style={{ width: collapsed ? "60px" : "220px", transition: "0.3s" }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4">
          {!collapsed && <h4 className="mb-0">BM Dashboard</h4>}
          <button
            className="btn btn-light btn-sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            <i className={`bi ${collapsed ? "bi-arrow-right" : "bi-arrow-left"}`}></i>
          </button>
        </div>

        {menuItems.map((item) => (
          <Link key={item.path} href={item.path} className="text-white text-decoration-none mb-2">
            <div className="d-flex align-items-center p-2 rounded hover-bg-light">
              <i className={`bi ${item.icon} me-2`} style={{ fontSize: "1.2rem" }}></i>
              {!collapsed && <span>{item.name}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-grow-1">
        {/* Topbar */}
        <nav className="navbar navbar-expand navbar-light bg-white shadow-sm">
          <div className="container-fluid justify-content-end">
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                type="button"
                id="profileMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {userName} <i className="bi bi-person-circle ms-1"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileMenu">
                <li>
                  <Link className="dropdown-item" href="/profile">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/logout">
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="p-4 bg-light" style={{ minHeight: "calc(100vh - 56px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
