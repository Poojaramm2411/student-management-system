import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const { token, role } = useSelector((state) => state.auth);

  if (token) {
    if (role === "ADMIN") return <Navigate to="/dashboard" replace />;
    if (role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
    if (role === "INSTRUCTOR") return <Navigate to="/instructor/dashboard" replace />;
  }

  return children;
}