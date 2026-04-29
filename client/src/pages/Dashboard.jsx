import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserPlus, QrCode, TrendingUp,
  ArrowRight, Clock, Building2
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

/**
 * Dashboard Page
 * Shows total employees, recent additions, and quick action shortcuts.
 */
export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all employees for stats (first page, large limit)
      const { data } = await api.get("/employees?limit=100");
      const employees = data.employees || [];
      const total = data.pagination?.total || employees.length;

      // Count employees added this month
      const now = new Date();
      const thisMonth = employees.filter((e) => {
        const d = new Date(e.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      // Recent 5
      setStats({ total, thisMonth });
      setRecent(employees.slice(0, 5));
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      id: "stat-total",
      label: "Total Employees",
      value: stats.total,
      icon: Users,
      gradient: "from-primary-500 to-primary-700",
      change: "Registered staff",
    },
    {
      id: "stat-month",
      label: "Added This Month",
      value: stats.thisMonth,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-700",
      change: "New joinings",
    },
    {
      id: "stat-qr",
      label: "QR Codes Generated",
      value: stats.total,
      icon: QrCode,
      gradient: "from-violet-500 to-violet-700",
      change: "Active QR codes",
    },
  ];

  const quickActions = [
    { id: "qa-add", label: "Add Employee", desc: "Register a new staff member", icon: UserPlus, to: "/add", color: "bg-primary-600" },
    { id: "qa-scan", label: "Scan QR Code", desc: "Identify employee via QR", icon: QrCode, to: "/scanner", color: "bg-violet-600" },
    { id: "qa-list", label: "View All Employees", desc: "Browse & manage staff", icon: Users, to: "/employees", color: "bg-emerald-600" },
  ];

  return (
    <div className="page-wrapper p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Overview of your employee management system
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ id, label, value, icon: Icon, gradient, change }) => (
          <div key={id} id={id} className="card">
            <div className="flex items-center gap-4">
              <div className={`stat-icon bg-gradient-to-br ${gradient}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? (
                    <span className="inline-block w-8 h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  ) : value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(({ id, label, desc, icon: Icon, to, color }) => (
            <button
              key={id}
              id={id}
              onClick={() => navigate(to)}
              className="card text-left hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer group"
            >
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all mt-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Employees */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
              Recently Added
            </h3>
          </div>
          <button
            onClick={() => navigate("/employees")}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No employees yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((emp) => (
              <div
                key={emp._id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Avatar */}
                {emp.photo ? (
                  <img
                    src={emp.photo}
                    alt={emp.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 dark:text-primary-400 font-semibold text-sm">
                      {emp.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{emp.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {emp.empId} · {emp.designation}
                  </p>
                </div>
                <span className="badge-purple flex-shrink-0">{emp.department}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
