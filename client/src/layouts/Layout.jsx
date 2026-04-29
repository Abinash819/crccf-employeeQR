import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

/**
 * Main dashboard layout.
 * Contains the persistent sidebar + top navbar wrapping all admin pages.
 */
const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/employees": "Employee List",
  "/add":       "Add Employee",
  "/scanner":   "QR Scanner",
};

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Match dynamic routes like /edit/:id
  const title = PAGE_TITLES[pathname] || (pathname.startsWith("/edit") ? "Edit Employee" : "Dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          onMenuToggle={() => setMobileOpen((p) => !p)}
          pageTitle={title}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
