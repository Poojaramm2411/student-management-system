import { Box, Typography, Button } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <Box sx={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      bgcolor: "background.default", gap: 2
    }}>
      <Box sx={{
        width: 80, height: 80, borderRadius: "50%",
        bgcolor: "rgba(239,68,68,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <LockOutlined sx={{ fontSize: 40, color: "error.main" }} />
      </Box>
      <Typography variant="h4" fontWeight={700}>403</Typography>
      <Typography variant="h6" fontWeight={600}>Unauthorized</Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        You don't have permission to access this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </Button>
    </Box>
  );
}