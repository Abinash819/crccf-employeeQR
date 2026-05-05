import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  User, Mail, Phone, Building2, Briefcase, Calendar,
  BadgeCheck, AlertTriangle, Loader2, QrCode
} from "lucide-react";

/**
 * EmployeeProfile — Public Profile Page
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the page that opens when someone scans an employee QR code with their
 * phone camera. It is completely PUBLIC — no login or token required.
 *
 * Flow:
 *   1. Phone camera scans QR → detects URL → opens this page in browser
 *   2. useParams() extracts :empId from the URL
 *   3. Fetches fresh employee data from GET /api/employees/:empId
 *   4. Renders a premium profile card
 *
 * Route: /employee/:empId  (registered as a public route in main.jsx)
 */

/*
 * API base for fetching employee data.
 * VITE_API_URL must point to the backend server reachable from the
 * device opening this page. On a phone via QR scan that means the
 * LAN IP, not localhost.
 * Set in client/.env:
 *   VITE_API_URL=http://192.168.1.35:5000/api
 */
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function EmployeeProfile() {
  const { empId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // ── Fetch employee data on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!empId) return;
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API}/employees/${encodeURIComponent(empId)}`);
        setEmployee(data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          setError("Employee not found. The ID may be invalid or the employee was removed.");
        } else {
          setError("Something went wrong while loading this profile. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [empId]);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="ep-wrapper">
        <div className="ep-card ep-loading-card">
          {/* Skeleton hero */}
          <div className="ep-skeleton-hero">
            <div className="ep-skeleton ep-skeleton-avatar" />
          </div>
          <div className="ep-skeleton-body">
            <div className="ep-skeleton ep-skeleton-title" />
            <div className="ep-skeleton ep-skeleton-sub" />
            <div className="ep-skeleton ep-skeleton-badge" />
            <div className="ep-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="ep-skeleton-item">
                  <div className="ep-skeleton ep-skeleton-icon" />
                  <div style={{ flex: 1 }}>
                    <div className="ep-skeleton ep-skeleton-label" />
                    <div className="ep-skeleton ep-skeleton-value" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ep-loading-overlay">
            <Loader2 className="ep-spinner" />
            <p className="ep-loading-text">Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="ep-wrapper">
        <div className="ep-card ep-error-card">
          <div className="ep-error-icon-wrap">
            <AlertTriangle className="ep-error-icon" />
          </div>
          <h1 className="ep-error-title">Profile Unavailable</h1>
          <p className="ep-error-message">{error}</p>
          <div className="ep-error-id">
            <QrCode size={14} />
            Scanned ID: <code>{empId}</code>
          </div>
        </div>
        <p className="ep-footer-text">Employee QR Management System</p>
      </div>
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const initials = employee.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(employee.joiningDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const details = [
    { icon: User,      label: "Employee ID",  value: employee.empId },
    { icon: Mail,      label: "Email",        value: employee.email },
    { icon: Phone,     label: "Phone",        value: employee.phone },
    { icon: Building2, label: "Department",   value: employee.department },
    { icon: Briefcase, label: "Designation",  value: employee.designation },
    { icon: Calendar,  label: "Joining Date", value: joinDate },
  ];

  // ── Profile card ─────────────────────────────────────────────────────────────
  return (
    <div className="ep-wrapper">
      <div className="ep-card ep-animate-in">

        {/* ── Hero gradient header ──────────────────────────────────── */}
        <div className="ep-hero">
          <div className="ep-hero-bg" />
          <div className="ep-hero-dots" />

          {/* Avatar */}
          <div className="ep-avatar-ring">
            <div className="ep-avatar">
              {employee.photo ? (
                <img src={employee.photo} alt={employee.name} className="ep-avatar-img" />
              ) : (
                <span className="ep-avatar-initials">{initials}</span>
              )}
            </div>
          </div>

          {/* Verified badge */}
          <div className="ep-verified-badge">
            <BadgeCheck size={13} />
            Verified Employee
          </div>
        </div>

        {/* ── Profile info ─────────────────────────────────────────── */}
        <div className="ep-body">
          <h1 className="ep-name">{employee.name}</h1>
          <p className="ep-designation">{employee.designation}</p>

          <div className="ep-chips">
            <span className="ep-chip ep-chip-dept">{employee.department}</span>
            <span className="ep-chip ep-chip-id">{employee.empId}</span>
          </div>

          {/* Divider */}
          <div className="ep-divider" />

          {/* Details grid */}
          <div className="ep-details-grid">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="ep-detail-item">
                <div className="ep-detail-icon-wrap">
                  <Icon className="ep-detail-icon" />
                </div>
                <div className="ep-detail-text">
                  <p className="ep-detail-label">{label}</p>
                  <p className="ep-detail-value">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card footer ──────────────────────────────────────────── */}
        <div className="ep-card-footer">
          <QrCode size={14} />
          <span>Profile loaded via QR scan · Data is live from the server</span>
        </div>
      </div>

      <p className="ep-footer-text">Employee QR Management System</p>

      {/* ── Scoped styles ────────────────────────────────────────────── */}
      <style>{`
        /* ── Layout ─────────────────────────────────────────────────── */
        .ep-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px 40px;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── Card ────────────────────────────────────────────────────── */
        .ep-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border-radius: 24px;
          overflow: visible; /* allow avatar ring to overlap without clipping */
          box-shadow: 0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08);
          position: relative;
        }

        /* ── Entrance animation ──────────────────────────────────────── */
        .ep-animate-in {
          animation: epSlideUp 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes epSlideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        /* ── Hero section ────────────────────────────────────────────── */
        .ep-hero {
          position: relative;
          height: 160px; /* slightly taller so avatar sits fully within view */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 0;
          overflow: visible; /* let avatar ring overflow below hero */
          border-radius: 24px 24px 0 0; /* keep rounded top corners */
        }
        /* clip only the decorative backgrounds, not the avatar */
        .ep-hero-bg,
        .ep-hero-dots {
          border-radius: 24px 24px 0 0;
          overflow: hidden;
        }
        .ep-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #4f46e5 100%);
        }
        .ep-hero-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .ep-avatar-ring {
          position: relative;
          z-index: 10;
          width: 104px;
          height: 104px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #818cf8);
          padding: 3px;
          margin-bottom: -52px; /* overlap into body section */
          box-shadow: 0 8px 32px rgba(109,40,217,0.5);
        }
        .ep-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #ede9fe;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 3px solid #fff;
        }
        .ep-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ep-avatar-initials {
          font-size: 32px;
          font-weight: 800;
          color: #6d28d9;
          line-height: 1;
          letter-spacing: -1px;
        }
        .ep-verified-badge {
          position: absolute;
          top: 12px;
          right: 14px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.3px;
        }

        /* ── Body ────────────────────────────────────────────────────── */
        .ep-body {
          padding: 64px 24px 24px; /* 64px top to clear the 104px avatar that overlaps by 52px */
          text-align: center;
        }
        .ep-name {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }
        .ep-designation {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 14px;
          font-weight: 500;
        }
        .ep-chips {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .ep-chip {
          display: inline-flex;
          align-items: center;
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }
        .ep-chip-dept {
          background: #ede9fe;
          color: #6d28d9;
        }
        .ep-chip-id {
          background: #e0f2fe;
          color: #0369a1;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.5px;
        }

        /* ── Divider ─────────────────────────────────────────────────── */
        .ep-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
          margin: 0 0 20px;
        }

        /* ── Details grid ────────────────────────────────────────────── */
        .ep-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          text-align: left;
        }
        @media (max-width: 360px) {
          .ep-details-grid { grid-template-columns: 1fr; }
        }
        .ep-detail-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 12px;
          transition: background 0.15s;
        }
        .ep-detail-item:hover {
          background: #f1f5f9;
        }
        .ep-detail-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #ede9fe, #ddd6fe);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ep-detail-icon {
          width: 15px;
          height: 15px;
          color: #7c3aed;
        }
        .ep-detail-text { overflow: hidden; }
        .ep-detail-label {
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin: 0 0 2px;
        }
        .ep-detail-value {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          word-break: break-word;
          line-height: 1.4;
        }

        /* ── Card footer ─────────────────────────────────────────────── */
        .ep-card-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 24px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          font-size: 10.5px;
          color: #94a3b8;
          font-weight: 500;
        }

        /* ── Page footer ─────────────────────────────────────────────── */
        .ep-footer-text {
          margin-top: 20px;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* ── Loading skeleton ────────────────────────────────────────── */
        .ep-loading-card { min-height: 500px; }
        .ep-skeleton-hero {
          height: 140px;
          background: linear-gradient(135deg, #6d28d9, #4f46e5);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 12px;
        }
        .ep-skeleton-body { padding: 60px 24px 24px; }
        .ep-skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: epShimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes epShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .ep-skeleton-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          margin-bottom: -45px;
          background: rgba(255,255,255,0.25) !important;
          animation: none;
        }
        .ep-skeleton-title  { height: 28px; width: 60%; margin: 0 auto 10px; }
        .ep-skeleton-sub    { height: 16px; width: 45%; margin: 0 auto 14px; }
        .ep-skeleton-badge  { height: 24px; width: 30%; margin: 0 auto 20px; border-radius: 999px; }
        .ep-skeleton-grid   {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .ep-skeleton-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border-radius: 12px;
          padding: 12px;
        }
        .ep-skeleton-icon  { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; }
        .ep-skeleton-label { height: 10px; width: 50%; margin-bottom: 6px; }
        .ep-skeleton-value { height: 14px; width: 80%; }
        .ep-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(3px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .ep-spinner {
          width: 36px;
          height: 36px;
          color: #7c3aed;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ep-loading-text {
          font-size: 14px;
          color: #6d28d9;
          font-weight: 600;
          margin: 0;
        }

        /* ── Error card ──────────────────────────────────────────────── */
        .ep-error-card {
          padding: 48px 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .ep-error-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: #fff7ed;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: epSlideUp 0.4s ease both;
        }
        .ep-error-icon {
          width: 36px;
          height: 36px;
          color: #f97316;
        }
        .ep-error-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .ep-error-message {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          line-height: 1.6;
          max-width: 300px;
        }
        .ep-error-id {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 11px;
          color: #64748b;
        }
        .ep-error-id code {
          font-family: monospace;
          color: #7c3aed;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
