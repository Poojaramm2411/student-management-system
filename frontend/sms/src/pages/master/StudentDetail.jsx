import { useLocation, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Card, Avatar, Grid, Typography } from "@mui/material";
import StatusBadge from "../../components/ui/StatusBadge";

export default function StudentDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const student = state?.student;

  if (!student) return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
      <Typography color="text.secondary" sx={{ mt: 2 }}>No student data found.</Typography>
    </Box>
  );

  const initials = student.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "ST";

  const fields = [
    { label: "Student ID", value: student.id },
    { label: "Student Code", value: student.studentCode },
    { label: "Email", value: student.email },
    { label: "Age", value: student.age || "—" },
    { label: "City", value: student.city || "—" },
    { label: "Batch", value: student.batchName || "—" },
    { label: "Batch ID", value: student.batchId || "—" },
    { label: "Status", value: <StatusBadge status={student.status} /> },
  ];

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Students
      </Button>

      <Card variant="outlined">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 3, borderBottom: "1px solid #E5E7EB" }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{student.name}</Typography>
            <Typography variant="body2" color="text.secondary">{student.email}</Typography>
          </Box>
          <Box sx={{ ml: "auto" }}><StatusBadge status={student.status} /></Box>
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