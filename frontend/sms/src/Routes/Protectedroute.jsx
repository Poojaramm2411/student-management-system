import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Wrap any route element with this to require login (and optionally a
 * specific role). Redirects to /login if not authenticated, or if the
 * logged-in user's role isn't in allowedRoles.
 *
 * Usage:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute allowedRoles={["ADMIN"]}>
 *       <Layout />
 *     </ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { token, role } = useSelector((s) => s.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}