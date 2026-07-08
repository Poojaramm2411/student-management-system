import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/Slices/authSlice";


export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, role, name, email } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return { token, role, name, email, handleLogout };
}