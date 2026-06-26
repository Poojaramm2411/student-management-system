import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/Slices/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const admin = useSelector((state) => state.auth.admin);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return { token, admin, handleLogout };
}
