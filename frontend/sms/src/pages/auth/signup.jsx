import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Paper, TextField, Button, Typography,
  ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import { registerStudent, registerInstructor } from "../../services/authService";

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
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", bgcolor: "#F1F5F9",
    }}>
      <Paper elevation={3} sx={{ p: 4, width: 400, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use the same email your admin registered you with
        </Typography>

        <ToggleButtonGroup
          value={role}
          exclusive
          onChange={(e, val) => val && setRole(val)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="STUDENT">I am a Student</ToggleButton>
          <ToggleButton value="INSTRUCTOR">I am an Instructor</ToggleButton>
        </ToggleButtonGroup>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            helperText="Must match the email your admin already entered for you"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth type="submit" variant="contained" size="large"
            disabled={loading} sx={{ mb: 2 }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <Typography variant="body2" align="center" color="text.secondary">
          Already registered?{" "}
          <Link to="/login" style={{ color: "#1565C0", fontWeight: 600 }}>
            Log in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
