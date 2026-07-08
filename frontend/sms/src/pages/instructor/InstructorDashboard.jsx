import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Button, AppBar, Toolbar,
  Chip, CircularProgress, Grid,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { getMyInstructorProfile } from "../../services/instructorProfileService";

function Field({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value ?? "—"}</Typography>
    </Grid>
  );
}

export default function InstructorDashboard() {
  const { handleLogout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyInstructorProfile();
        setProfile(data);
      } catch (err) {
        toast.error("Failed to load your profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F1F5F9" }}>
      <AppBar position="static" sx={{ bgcolor: "#1565C0" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>Instructor Portal</Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : !profile ? (
          <Typography color="text.secondary">Couldn't load your profile.</Typography>
        ) : (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, maxWidth: 700 }}>
            <Box sx={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", mb: 3,
            }}>
              <Typography variant="h5" fontWeight={700}>{profile.name}</Typography>
              <Chip
                label={profile.status}
                color={profile.status === "ACTIVE" ? "success" : "default"}
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Grid container spacing={3}>
              <Field label="Email" value={profile.email} />
              <Field label="Phone" value={profile.phone} />
              <Field label="Specialization" value={profile.specialization} />
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
}