import { Chip } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

export default function StatusBadge({ status, onClick }) {
  const isActive = status === "ACTIVE" || status === "Active";
  return (
    <Chip
      label={isActive ? "Active" : "Inactive"}
      size="small"
      icon={isActive ? <CheckCircle sx={{ fontSize: "14px !important" }} /> : <Cancel sx={{ fontSize: "14px !important" }} />}
      onClick={onClick}
      sx={{
        fontWeight: 600,
        fontSize: 11,
        borderRadius: "100px",
        cursor: onClick ? "pointer" : "default",
        bgcolor: isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
        color: isActive ? "#34d399" : "#f87171",
        border: `1px solid ${isActive ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
        "& .MuiChip-icon": { color: "inherit" },
        "&:hover": onClick ? { opacity: 0.8 } : {},
      }}
    />
  );
}