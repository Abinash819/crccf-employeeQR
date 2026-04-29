import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Edit2, Trash2, Download, ChevronLeft, ChevronRight,
  Users, FileDown, QrCode, Plus, X, ExternalLink
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import Papa from "papaparse";
import api from "../utils/api";
import toast from "react-hot-toast";
import { getQRUrl } from "../utils/qrUrl";

/**
 * Employee List Page
 * Full-featured table with search, pagination, edit/delete, QR download and CSV export.
 */
export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading]     = useState(true);
  const [deleteId, setDeleteId]   = useState(null);
  const [qrEmployee, setQrEmployee] = useState(null); // for QR preview modal

  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const LIMIT = 10;

  // ── Fetch employees ────────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async (q = search, p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/employees?search=${q}&page=${p}&limit=${LIMIT}`);
      setEmployees(data.employees || []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
    } catch {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [page]);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchEmployees(search, 1);
    }, 400);
  }, [search]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      toast.success("Employee deleted");
      setDeleteId(null);
      fetchEmployees(search, page);
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  const exportCSV = async () => {
    try {
      const { data } = await api.get(`/employees?search=${search}&limit=10000`);
      const rows = data.employees.map((e) => ({
        "Employee ID": e.empId,
        Name: e.name,
        Email: e.email,
        Phone: e.phone,
        Department: e.department,
        Designation: e.designation,
        "Joining Date": new Date(e.joiningDate).toLocaleDateString(),
        "Added On": new Date(e.createdAt).toLocaleDateString(),
      }));
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `employees_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported!");
    } catch {
      toast.error("Export failed");
    }
  };

  // ── QR Download ───────────────────────────────────────────────────────────
  const downloadQR = (empId) => {
    const canvas = document.getElementById(`qr-canvas-${empId}`);
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${empId}.png`;
    a.click();
    toast.success("QR downloaded!");
  };

  return (
    <div className="page-wrapper p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.total} total employees
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button id="export-csv-btn" onClick={exportCSV} className="btn-secondary">
            <FileDown className="w-4 h-4" /> Export CSV
          </button>
          <button id="add-employee-btn" onClick={() => navigate("/add")} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="employee-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID or department…"
          className="form-input pl-9"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Employee", "ID", "Department", "Designation", "Joining Date", "Actions"].map((h) => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No employees found</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="table-row">
                    {/* Employee name + avatar */}
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        {emp.photo ? (
                          <img src={emp.photo} alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 dark:text-primary-400 font-semibold text-xs">
                              {emp.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{emp.name}</p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge-blue">{emp.empId}</span>
                    </td>
                    <td className="table-cell">
                      <span className="badge-purple">{emp.department}</span>
                    </td>
                    <td className="table-cell text-gray-600 dark:text-gray-300">{emp.designation}</td>
                    <td className="table-cell text-gray-600 dark:text-gray-300">
                      {new Date(emp.joiningDate).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </td>
                    {/* Actions */}
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {/* Hidden QR canvas for download — embeds full profile URL */}
                        <div className="hidden">
                          <QRCodeCanvas
                            id={`qr-canvas-${emp.empId}`}
                            value={getQRUrl(emp.empId)}
                            size={256}
                            level="H"
                          />
                        </div>
                        <button
                          title="View QR"
                          onClick={() => setQrEmployee(emp)}
                          className="btn-icon text-violet-500 hover:text-violet-700"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          title="Download QR"
                          onClick={() => downloadQR(emp.empId)}
                          className="btn-icon text-emerald-500 hover:text-emerald-700"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => navigate(`/edit/${emp._id}`)}
                          className="btn-icon text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteId(emp._id)}
                          className="btn-icon text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {page} of {pagination.totalPages} · {pagination.total} results
            </p>
            <div className="flex gap-2">
              <button
                id="prev-page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-icon disabled:opacity-40 disabled:cursor-not-allowed text-gray-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="next-page-btn"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-icon disabled:opacity-40 disabled:cursor-not-allowed text-gray-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── QR Preview Modal ──────────────────────────────────────────── */}
      {qrEmployee && (
        <QRModal employee={qrEmployee} onClose={() => setQrEmployee(null)} />
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Employee?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              This action cannot be undone. The employee and their QR code reference will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={() => handleDelete(deleteId)}
                className="btn-danger flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── QR Modal sub-component ────────────────────────────────────────────────────
function QRModal({ employee, onClose }) {
  const canvasRef = useRef(null);

  const handleDownload = () => {
    const canvas = document.getElementById(`qr-modal-canvas`);
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${employee.empId}.png`;
    a.click();
    toast.success("QR downloaded!");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const canvas = document.getElementById("qr-modal-canvas");
    const imgData = canvas ? canvas.toDataURL("image/png") : "";
    printWindow.document.write(`
      <html><head><title>ID Card - ${employee.name}</title>
      <style>
        body { margin:0; font-family: Arial, sans-serif; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f4f8; }
        .card { background:white; border-radius:16px; padding:32px 24px; width:280px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.15); border: 3px solid #7c3aed; }
        .company { color:#7c3aed; font-size:13px; font-weight:700; letter-spacing:1px; margin-bottom:16px; }
        .avatar { width:64px; height:64px; border-radius:50%; background:#ede9fe; display:inline-flex; align-items:center; justify-content:center; font-size:24px; font-weight:700; color:#7c3aed; margin-bottom:12px; overflow:hidden; }
        .avatar img { width:64px; height:64px; object-fit:cover; }
        .name { font-size:18px; font-weight:700; color:#1e293b; margin-bottom:4px; }
        .designation { font-size:12px; color:#64748b; margin-bottom:4px; }
        .department { font-size:12px; color:#7c3aed; font-weight:600; margin-bottom:16px; }
        .qr-img { width:120px; height:120px; margin: 0 auto 12px; }
        .emp-id { font-size:11px; color:#94a3b8; letter-spacing:1px; }
        .divider { border:none; border-top:1px solid #e2e8f0; margin:16px 0; }
      </style></head>
      <body>
        <div class="card">
          <div class="company">EMPLOYEE ID CARD</div>
          <div class="avatar">${employee.photo ? `<img src="${employee.photo}" />` : employee.name.charAt(0)}</div>
          <div class="name">${employee.name}</div>
          <div class="designation">${employee.designation}</div>
          <div class="department">${employee.department}</div>
          <hr class="divider" />
          <img class="qr-img" src="${imgData}" />
          <div class="emp-id">ID: ${employee.empId}</div>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">QR Code</h3>
          <button onClick={onClose} className="btn-icon text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {employee.name} · {employee.empId}
          </p>
          <div className="flex justify-center p-4 bg-white rounded-xl border border-gray-100">
            <QRCodeCanvas
              id="qr-modal-canvas"
              value={getQRUrl(employee.empId)}
              size={180}
              level="H"
              includeMargin
            />
          </div>
          <p className="text-xs text-gray-400">Scan to open employee profile in browser</p>
          <a
            href={`/employee/${employee.empId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Open Profile Page
          </a>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={handleDownload} className="btn-primary flex-1 justify-center text-xs">
            <Download className="w-3.5 h-3.5" /> Download PNG
          </button>
          <button onClick={handlePrint} className="btn-secondary flex-1 justify-center text-xs">
            Print ID Card
          </button>
        </div>
      </div>
    </div>
  );
}
