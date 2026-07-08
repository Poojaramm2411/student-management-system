import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Button, AppBar, Toolbar,
  Chip, CircularProgress, Grid, Divider,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { getMyStudentProfile, getMyStudentFees } from "../../services/studentProfileService";

const STATUS_COLOR = {
  Paid: "success",
  Pending: "error",
  Partial: "warning",
};

function Field({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value ?? "—"}</Typography>
    </Grid>
  );
}

function money(n) {
  return n == null ? "—" : `₹ ${Number(n).toLocaleString("en-IN")}`;
}

export default function StudentDashboard() {
  const { handleLogout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileData, feeData] = await Promise.all([
          getMyStudentProfile(),
          getMyStudentFees(),
        ]);
        setProfile(profileData);
        setFees(feeData);
      } catch (err) {
        toast.error("Failed to load your details");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F1F5F9" }}>
      <AppBar position="static" sx={{ bgcolor: "#1565C0" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>Student Portal</Typography>
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 700 }}>

            {/* Profile card */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", mb: 3,
              }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{profile.name}</Typography>
                  <Typography
                    variant="body2" color="text.secondary"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {profile.studentCode}
                  </Typography>
                </Box>
                <Chip
                  label={profile.status}
                  color={profile.status === "ACTIVE" ? "success" : "default"}
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Grid container spacing={3}>
                <Field label="Email" value={profile.email} />
                <Field label="Age" value={profile.age} />
                <Field label="City" value={profile.city} />
                <Field label="Course" value={profile.courseName} />
                <Field label="Batch" value={profile.batchName} />
                <Field label="Batch Code" value={profile.batchCode} />
              </Grid>
            </Paper>

            {/* Fee cards */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Fee Details
              </Typography>

              {fees.length === 0 ? (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography color="text.secondary">
                    No enrollment/fee record found yet.
                  </Typography>
                </Paper>
              ) : (
                fees.map((fee) => (
                  <Paper key={fee.id} elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
                    <Box sx={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", mb: 2,
                    }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {fee.courseName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {fee.batchName}
                        </Typography>
                      </Box>
                      <Chip
                        label={fee.feeStatus}
                        size="small"
                        color={STATUS_COLOR[fee.feeStatus] || "default"}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Field label="Base Fee" value={money(fee.baseFee)} />
                      <Field label="GST" value={money(fee.gstAmount)} />
                      <Field label="Total Fee" value={money(fee.totalFee)} />
                      <Field label="Paid" value={money(fee.paidAmount)} />
                      <Field label="Balance Due" value={money(fee.balanceDue)} />
                      <Field label="Payment Mode" value={fee.paymentMode} />
                      <Field label="Enrolled Date" value={fee.enrolledDate} />
                    </Grid>
                  </Paper>
                ))
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}