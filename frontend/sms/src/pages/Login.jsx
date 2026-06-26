import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box, Button, TextField, Typography, Paper,
  InputAdornment, CircularProgress, Divider
} from "@mui/material";
import { Email, Lock, ArrowForward, School } from "@mui/icons-material";
import { login } from "../store/Slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Added
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back!");
    const from = location.state?.from?.pathname || "/dashboard";
setTimeout(() => navigate(from, { replace: true }), 100);// ✅ Changed
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      {/* LEFT */}
      <Box sx={{
        flex: 1, display: { xs: "none", md: "flex" }, flexDirection: "column",
        justifyContent: "center", alignItems: "center", px: 8,
        background: "linear-gradient(145deg,#0f0f1a 0%,#1a1040 50%,#0c1a40 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* glow effects */}
        <Box sx={{ position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)",
          top: -100, left: -100 }} />
        <Box sx={{ position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)",
          bottom: -100, right: -50 }} />

        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 420 }}>
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 0.75,
            bgcolor: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "100px", mb: 4,
          }}>
            <School sx={{ fontSize: 14, color: "primary.light" }} />
            <Typography variant="caption" sx={{ color: "primary.light", fontWeight: 700, letterSpacing: 0.5 }}>
              Student Management System
            </Typography>
          </Box>

          <Typography variant="h3" fontWeight={800} letterSpacing={-1.5} mb={2} lineHeight={1.1}>
            Manage your{" "}
            <Box component="span" sx={{
              background: "linear-gradient(135deg,#818cf8,#06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              students smarter
            </Box>
          </Typography>

          <Typography color="text.secondary" mb={5} lineHeight={1.7}>
            A complete platform to manage batches, courses, instructors, and students in one place.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 5 }}>
            {[["500+", "Students"], ["50+", "Courses"], ["20+", "Instructors"]].map(([num, label]) => (
              <Box key={label} textAlign="center">
                <Typography variant="h5" fontWeight={800}>{num}</Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* RIGHT */}
      <Box sx={{
        width: { xs: "100%", md: 460 }, display: "flex", alignItems: "center",
        justifyContent: "center", px: 4,
        bgcolor: "background.paper", borderLeft: "1px solid", borderColor: "divider",
      }}>
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: 2,
              background: "linear-gradient(135deg,#6366f1,#06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <School sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>Sign in</Typography>
              <Typography variant="caption" color="text.secondary">Enter your credentials</Typography>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              fullWidth label="Email Address" type="email" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> }}
            />
            <TextField
              fullWidth label="Password" type="password" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> }}
            />

            <Box sx={{ textAlign: "right", mt: -1 }}>
              <Typography variant="caption" sx={{ color: "primary.light", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
                Forgot Password?
              </Typography>
            </Box>

            <Button type="submit" variant="contained" size="large" fullWidth
              disabled={loading} endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
              sx={{ py: 1.5, fontSize: 15, fontWeight: 600 }}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}