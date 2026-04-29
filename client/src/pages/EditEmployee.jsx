import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { ChevronLeft, Save, Loader2, Upload, X, Info } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

/**
 * Edit Employee Page
 * Loads existing employee data, allows editing all fields EXCEPT empId.
 * The QR code is displayed but remains unchanged after update.
 */
const DEPARTMENTS = [
  "Engineering", "Marketing", "Sales", "HR", "Finance",
  "Operations", "Design", "Legal", "IT", "Management"
];

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch employee on mount
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // Get from employee list since we have _id not empId
        const { data } = await api.get(`/employees?limit=1000`);
        const emp = data.employees.find((e) => e._id === id);
        if (!emp) {
          toast.error("Employee not found");
          navigate("/employees");
          return;
        }
        setForm({
          empId: emp.empId,
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          department: emp.department,
          designation: emp.designation,
          joiningDate: emp.joiningDate
            ? new Date(emp.joiningDate).toISOString().split("T")[0]
            : "",
          photo: emp.photo || "",
        });
        setPhotoPreview(emp.photo || null);
      } catch {
        toast.error("Failed to load employee");
        navigate("/employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
    setSaving(true);
    try {
      await api.put(`/employees/update/${id}`, form);
      toast.success("Employee updated successfully!");
      navigate("/employees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-wrapper p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-icon text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Employee</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Update details — QR code will remain the same.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* QR Preview (read-only) */}
        <div className="card flex items-center gap-5">
          <div className="p-2 bg-white rounded-xl border border-gray-100 flex-shrink-0">
            <QRCodeCanvas value={form.empId} size={80} level="H" includeMargin />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-1">
              <Info className="w-3.5 h-3.5" />
              QR code is permanent and cannot be changed
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Employee ID: <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-primary-600 dark:text-primary-400">{form.empId}</code>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Scanning this QR will always return the latest data</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Photo */}
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
              <p className="text-xs text-gray-400">Optional · Max 2 MB</p>
              {photoPreview && (
                <button type="button"
                  onClick={() => { setPhotoPreview(null); setForm((p) => ({ ...p, photo: "" })); }}
                  className="text-xs text-red-400 hover:text-red-600 mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" /> Remove
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input value={form.empId} readOnly
                className="form-input bg-gray-50 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-name" className="form-label">Full Name *</label>
              <input id="edit-name" name="name" value={form.name} onChange={handleChange}
                className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-email" className="form-label">Email *</label>
              <input id="edit-email" type="email" name="email" value={form.email} onChange={handleChange}
                className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-phone" className="form-label">Phone *</label>
              <input id="edit-phone" name="phone" value={form.phone} onChange={handleChange}
                className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-department" className="form-label">Department *</label>
              <select id="edit-department" name="department" value={form.department} onChange={handleChange}
                className="form-input">
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-designation" className="form-label">Designation *</label>
              <input id="edit-designation" name="designation" value={form.designation} onChange={handleChange}
                className="form-input" />
            </div>
            <div className="form-group sm:col-span-2">
              <label htmlFor="edit-joiningDate" className="form-label">Joining Date *</label>
              <input id="edit-joiningDate" type="date" name="joiningDate" value={form.joiningDate}
                onChange={handleChange} className="form-input" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button id="save-employee-btn" type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
