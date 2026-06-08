/**
 * Configuration helper to determine the backend API URL.
 * 
 * Local Dev: Uses relative paths (e.g., '/api/...') which are proxied by Vite to localhost:5000.
 * Production: Uses the VITE_API_URL environment variable (e.g., https://your-backend.onrender.com)
 *             which you can configure in Vercel settings.
 * 
 * @param {string} path API endpoint path (should start with /api)
 * @returns {string} Fully resolved API URL
 */
export const getApiUrl = (path) => {
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${path}`;
};
