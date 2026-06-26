import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = useSelector((state) => state.auth.token);

  if (token) {
    return <Navigate to="/dashboard" replace />; // already logged in → go to dashboard
  }

  return children;
}