/**
 * qrUrl.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central utility for generating the URL that gets embedded inside every QR code.
 *
 * Why a URL instead of a bare empId?
 *   • Any phone camera (iOS / Android) can scan the QR and tap to open the
 *     employee profile directly in the browser — no dedicated scanner app needed.
 *   • The QR code never changes (same URL), but the page always shows fresh data
 *     fetched from MongoDB, so editing an employee's details "updates" the QR
 *     profile automatically.
 *
 * To deploy to production, just change VITE_APP_URL in client/.env:
 *   VITE_APP_URL=https://yourdomain.com
 */

/**
 * Returns the full profile URL to embed in a QR code.
 * @param {string} empId - The unique employee ID (e.g. "EMP-001")
 * @returns {string} Full URL e.g. "http://localhost:5173/employee/EMP-001"
 */
export const getQRUrl = (empId) => {
  const base =
    import.meta.env.VITE_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:5173";
  return `${base}/employee/${empId}`;
};

/**
 * Extracts the empId from a QR-scanned string that may be:
 *   (a) A full URL  → "http://localhost:5173/employee/EMP-001"  returns "EMP-001"
 *   (b) A bare ID   → "EMP-001"                                 returns "EMP-001"
 *
 * This keeps backward compatibility with old printed QR cards that stored
 * only the empId, not a URL.
 *
 * @param {string} scanned - Raw string decoded from QR scan
 * @returns {string} The extracted empId
 */
export const extractEmpId = (scanned) => {
  const trimmed = scanned.trim();
  // Check if it looks like a URL containing /employee/
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/employee\/(.+)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
  } catch {
    // Not a valid URL — treat the whole string as a bare empId
  }
  return trimmed;
};
