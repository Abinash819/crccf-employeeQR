import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Layout from "./layouts/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import EmployeeList from "./pages/EmployeeList";
import QRScanner from "./pages/QRScanner";
import EmployeeProfile from "./pages/EmployeeProfile"; // Public — no login required

import "./index.css";

/**
 * ProtectedRoute
 * Redirects unauthenticated users to /login.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * App — top-level route tree
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — no login required */}
        <Route path="/login" element={<Login />} />

        {/*
         * PUBLIC: Employee profile page opened by QR scan.
         * Any phone camera scans the QR → browser opens /employee/:empId
         * No auth middleware — fully accessible to anyone with the QR code.
         */}
        <Route path="/employee/:empId" element={<EmployeeProfile />} />

        {/* Protected: all admin routes wrapped in Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="add" element={<AddEmployee />} />
          <Route path="edit/:id" element={<EditEmployee />} />
          <Route path="scanner" element={<QRScanner />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
