import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  UserPlus, Upload, X, Download, ChevronLeft, Loader2, ExternalLink
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { getQRUrl } from "../utils/qrUrl";

/**
 * Add Employee Page
 * Form for creating a new employee. Generates QR code preview on submission.
 * Stores QR reference in localStorage after generation.
 */
const DEPARTMENTS = [
  "Engineering", "Marketing", "Sales", "HR", "Finance",
  "Operations", "Design", "Legal", "IT", "Management"
];

export default function AddEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null); // show QR after success
  const [photoPreview, setPhotoPreview] = useState(null);

  const [form, setForm] = useState({
    empId: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    joiningDate: "",
    photo: "",
  });

  const fileRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Convert photo to base64
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      setForm((prev) => ({ ...prev, photo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const required = ["empId", "name", "email", "phone", "department", "designation", "joiningDate"];
    for (const field of required) {
      if (!form[field]) {
        toast.error(`Please fill in ${field}`);
        return;
      }
    }

    setLoading(true);
    try {
      const { data } = await api.post("/employees/add", form);
      const emp = data.employee;

      // ── Save QR reference to localStorage ─────────────────────────────
      const stored = JSON.parse(localStorage.getItem("qr_refs") || "{}");
      stored[emp.empId] = {
        empId: emp.empId,
        name: emp.name,
        addedAt: new Date().toISOString(),
      };
      localStorage.setItem("qr_refs", JSON.stringify(stored));

      toast.success("Employee added & QR generated!");
      setCreatedEmployee(emp);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("new-emp-qr");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${createdEmployee.empId}.png`;
    a.click();
    toast.success("QR downloaded!");
  };

  // ── Success state: show QR ────────────────────────────────────────────────
  if (createdEmployee) {
    return (
      <div className="page-wrapper p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="card w-full max-w-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employee Added!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            QR code generated for <strong>{createdEmployee.name}</strong>
          </p>

          <div className="flex justify-center p-4 bg-white rounded-xl border border-gray-100">
            <QRCodeCanvas
              id="new-emp-qr"
              value={getQRUrl(createdEmployee.empId)}
              size={180}
              level="H"
              includeMargin
            />
          </div>
          <p className="text-xs text-gray-400">
            Scans open:
            <a
              href={getQRUrl(createdEmployee.empId)}
              target="_blank"
              rel="noreferrer"
              className="ml-1 text-primary-500 hover:underline inline-flex items-center gap-0.5"
            >
              /employee/{createdEmployee.empId} <ExternalLink className="w-3 h-3" />
            </a>
          </p>

          <div className="flex gap-2 pt-2">
            <button onClick={downloadQR} className="btn-primary flex-1 justify-center">
              <Download className="w-4 h-4" /> Download QR
            </button>
            <button onClick={() => { setCreatedEmployee(null); setForm({ empId:"",name:"",email:"",phone:"",department:"",designation:"",joiningDate:"",photo:"" }); setPhotoPreview(null); }}
              className="btn-secondary flex-1 justify-center">
              Add Another
            </button>
          </div>
          <button onClick={() => navigate("/employees")} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            View all employees →
          </button>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-icon text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Employee</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Fill in the details below. A QR code will be generated automatically.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Photo Upload */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => fileRef.current.click()}
            className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600 
                       flex flex-col items-center justify-center cursor-pointer 
                       hover:border-primary-400 transition-colors overflow-hidden"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Photo</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Employee Photo</p>
            <p className="text-xs text-gray-400">Optional · Max 2 MB · JPG/PNG</p>
            {photoPreview && (
              <button type="button" onClick={() => { setPhotoPreview(null); setForm((p) => ({ ...p, photo: "" })); }}
                className="text-xs text-red-400 hover:text-red-600 mt-1 flex items-center gap-1">
                <X className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="empId" className="form-label">Employee ID *</label>
            <input id="empId" name="empId" value={form.empId} onChange={handleChange}
              placeholder="e.g. EMP-001" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange}
              placeholder="John Doe" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email *</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="john@company.com" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone *</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange}
              placeholder="+91 98765 43210" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="department" className="form-label">Department *</label>
            <select id="department" name="department" value={form.department} onChange={handleChange}
              className="form-input">
              <option value="">Select department…</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="designation" className="form-label">Designation *</label>
            <input id="designation" name="designation" value={form.designation} onChange={handleChange}
              placeholder="Software Engineer" className="form-input" />
          </div>
          <div className="form-group sm:col-span-2">
            <label htmlFor="joiningDate" className="form-label">Joining Date *</label>
            <input id="joiningDate" type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange}
              className="form-input" />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button id="add-emp-submit-btn" type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? "Adding…" : "Add Employee & Generate QR"}
          </button>
        </div>
      </form>
    </div>
  );
}
