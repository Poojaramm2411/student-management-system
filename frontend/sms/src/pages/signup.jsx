import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Paper, TextField, Button, Typography,
  ToggleButtonGroup, ToggleButton, InputAdornment,
} from "@mui/material";
import { Email, Lock, School, Person, HowToReg } from "@mui/icons-material";
import { registerStudent, registerInstructor } from "../services/authService";

export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const register = role === "STUDENT" ? registerStudent : registerInstructor;
      const data = await register(email, password);
      toast.success(data.message || "Account activated! Please log in.");
      navigate("/login");
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
          width: 440,
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
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(16, 185, 129, 0.35)",
              mb: 2,
            }}
          >
            <HowToReg sx={{ fontSize: 30, color: "#FFFFFF" }} />
          </Box>
          <Typography variant="h5" fontWeight={800} letterSpacing={-0.5} color="#0F172A">
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: "center" }}>
            Use the registered email provided by your administrator
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={role}
          exclusive
          onChange={(e, val) => val && setRole(val)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="STUDENT" sx={{ borderRadius: "10px 0 0 10px", py: 1.2, fontWeight: 700 }}>
            <School fontSize="small" sx={{ mr: 1 }} /> Student
          </ToggleButton>
          <ToggleButton value="INSTRUCTOR" sx={{ borderRadius: "0 10px 10px 0", py: 1.2, fontWeight: 700 }}>
            <Person fontSize="small" sx={{ mr: 1 }} /> Instructor
          </ToggleButton>
        </ToggleButtonGroup>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Email fontSize="small" sx={{ color: "#94A3B8" }} /></InputAdornment>
              ),
            }}
            helperText="Must match the email entered by your admin"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Lock fontSize="small" sx={{ color: "#94A3B8" }} /></InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Lock fontSize="small" sx={{ color: "#94A3B8" }} /></InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth type="submit" variant="contained" color="secondary" size="large"
            disabled={loading} sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 700, fontSize: 15, mb: 2.5 }}
          >
            {loading ? "Activating account..." : "Activate Account"}
          </Button>
        </form>

        <Typography variant="body2" align="center" color="text.secondary">
          Already registered?{" "}
          <Link to="/login" style={{ color: "#4F46E5", fontWeight: 700, textDecoration: "none" }}>
            Log in here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}