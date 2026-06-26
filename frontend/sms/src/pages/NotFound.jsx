import { Box, Typography, Button } from "@mui/material";
import { SearchOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      bgcolor: "background.default", gap: 2
    }}>
      <Box sx={{
        width: 80, height: 80, borderRadius: "50%",
        bgcolor: "rgba(99,102,241,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <SearchOff sx={{ fontSize: 40, color: "primary.main" }} />
      </Box>
      <Typography variant="h4" fontWeight={700}>404</Typography>
      <Typography variant="h6" fontWeight={600}>Page Not Found</Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        The page you're looking for doesn't exist.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </Button>
    </Box>
  );
}