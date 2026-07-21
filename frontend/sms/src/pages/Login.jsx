import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Paper, TextField, Button, Typography, InputAdornment, IconButton,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff, School } from "@mui/icons-material";
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
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#F8FAFC",
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(79,70,229,0.12) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(6,182,212,0.12) 0px, transparent 50%)
      `,
      p: 2,
    }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3.5, sm: 4.5 },
          width: 420,
          borderRadius: 4,
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.08)",
        }}
        className="fade-in"
      >
        {/* BRAND LOGO HEADER */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(79, 70, 229, 0.35)",
              mb: 2,
            }}
          >
            <School sx={{ fontSize: 30, color: "#FFFFFF" }} />
          </Box>
          <Typography variant="h5" fontWeight={800} letterSpacing={-0.5} color="#0F172A">
            Student<Box component="span" sx={{ color: "#4F46E5" }}>MS</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Welcome back! Log in to access your portal
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Email fontSize="small" sx={{ color: "#94A3B8" }} /></InputAdornment>
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
                <InputAdornment position="start"><Lock fontSize="small" sx={{ color: "#94A3B8" }} /></InputAdornment>
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
            disabled={loading} sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 700, fontSize: 15, mb: 2.5 }}
          >
            {loading ? "Logging in..." : "Log In to Portal"}
          </Button>
        </form>

        <Typography variant="body2" align="center" color="text.secondary">
          Student or Instructor?{" "}
          <Link to="/signup" style={{ color: "#4F46E5", fontWeight: 700, textDecoration: "none" }}>
            Sign up here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}