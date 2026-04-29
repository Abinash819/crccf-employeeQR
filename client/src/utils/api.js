import axios from "axios";

/**
 * Axios instance pre-configured for the backend API.
 * Automatically attaches the JWT token from localStorage to every request.
 *
 * Base URL is read from VITE_API_URL environment variable:
 *   - Development: http://localhost:5000/api  (set in client/.env)
 *   - Production:  https://your-app.onrender.com/api  (set in Vercel env vars)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor — inject Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("qr_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token
      localStorage.removeItem("qr_admin_token");
      localStorage.removeItem("qr_admin_info");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
