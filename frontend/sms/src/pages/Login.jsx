import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Paper, TextField, Button, Typography, InputAdornment, IconButton,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { login } from "../services/authService";
import { setAuth } from "../store/Slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      dispatch(setAuth(data));
      toast.success(`Welcome back, ${data.name}!`);

      if (data.role === "ADMIN") navigate("/dashboard");
      else if (data.role === "STUDENT") navigate("/student/dashboard");
      else if (data.role === "INSTRUCTOR") navigate("/instructor/dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", bgcolor: "#F1F5F9",
    }}>
      <Paper elevation={3} sx={{ p: 4, width: 380, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Log in to your account
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Email fontSize="small" /></InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth type="submit" variant="contained" size="large"
            disabled={loading} sx={{ mb: 2 }}
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <Typography variant="body2" align="center" color="text.secondary">
          Student or Instructor?{" "}
          <Link to="/signup" style={{ color: "#1565C0", fontWeight: 600 }}>
            Sign up here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}