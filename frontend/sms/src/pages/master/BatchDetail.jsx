import { useLocation, useNavigate } from "react-router-dom";
import { ArrowBack, Layers } from "@mui/icons-material";
import { Box, Button, Card, Avatar, Grid, Typography } from "@mui/material";
import StatusBadge from "../../components/ui/StatusBadge";

export default function BatchDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const batch = state?.batch;

  if (!batch) return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
      <Typography color="text.secondary" sx={{ mt: 2 }}>No batch data found.</Typography>
    </Box>
  );

  const fields = [
    { label: "Batch ID", value: batch.id },
    { label: "Batch Code", value: batch.batchCode },
    { label: "Instructor", value: batch.instructorName || "—" },
    { label: "Instructor ID", value: batch.instructorId || "—" },
    { label: "Start Date", value: batch.startDate || "—" },
    { label: "End Date", value: batch.endDate || "—" },
    { label: "Status", value: <StatusBadge status={batch.status} /> },
  ];

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Batches
      </Button>

      <Card variant="outlined">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 3, borderBottom: "1px solid #E5E7EB" }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
            <Layers />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{batch.batchName}</Typography>
            <Typography variant="body2" color="text.secondary">{batch.batchCode}</Typography>
          </Box>
          <Box sx={{ ml: "auto" }}><StatusBadge status={batch.status} /></Box>
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