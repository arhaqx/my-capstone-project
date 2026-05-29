import { Navigate } from "react-router-dom";

export function parseJwt(token) {
  try {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let pad = base64.length % 4;
    if (pad) {
      base64 += new Array(5 - pad).join('=');
    }
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
}

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = parseJwt(token);
  if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
