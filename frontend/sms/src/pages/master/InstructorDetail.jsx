import { useLocation, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Card, Avatar, Grid, Typography } from "@mui/material";
import StatusBadge from "../../components/ui/StatusBadge";

export default function InstructorDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const instructor = state?.instructor;

  if (!instructor) return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
      <Typography color="text.secondary" sx={{ mt: 2 }}>No instructor data found.</Typography>
    </Box>
  );

  const initials = instructor.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "IN";

  const fields = [
    { label: "Instructor ID", value: instructor.id },
    { label: "Email", value: instructor.email },
    { label: "Phone", value: instructor.phone || "—" },
    { label: "Specialization", value: instructor.specialization || "—" },
    { label: "Status", value: <StatusBadge status={instructor.status} /> },
  ];

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Instructors
      </Button>

      <Card variant="outlined">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 3, borderBottom: "1px solid #E5E7EB" }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{instructor.name}</Typography>
            <Typography variant="body2" color="text.secondary">{instructor.email}</Typography>
          </Box>
          <Box sx={{ ml: "auto" }}><StatusBadge status={instructor.status} /></Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {fields.map(({ label, value }) => (
              <Grid item xs={12} sm={6} md={4} key={label}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 500 }}>{value}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>
    </Box>
  );
}