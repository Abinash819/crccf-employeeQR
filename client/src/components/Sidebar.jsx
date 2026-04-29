import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserPlus, QrCode, LogOut, Menu, X, Building2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Sidebar Navigation
 * Responsive: collapsible on mobile via hamburger toggle.
 * Highlights active route with primary color.
 */
const navLinks = [
  { to: "/dashboard", label: "Dashboard",      icon: LayoutDashboard },
  { to: "/employees",  label: "Employees",      icon: Users            },
  { to: "/add",        label: "Add Employee",   icon: UserPlus         },
  { to: "/scanner",    label: "QR Scanner",     icon: QrCode           },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-sidebar z-30
          flex flex-col transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">EmployeeQR</p>
              <p className="text-gray-500 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: admin info + logout */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">Admin</p>
              <p className="text-gray-500 text-xs truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
