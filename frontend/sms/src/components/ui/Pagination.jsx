import { Box, Pagination as MuiPagination, Typography } from "@mui/material";

export default function Pagination({ currentPage, totalPages, totalElements, size = 10, onPageChange }) {
  if (totalPages <= 1) return null;
  const start = currentPage * size + 1;
  const end = Math.min((currentPage + 1) * size, totalElements);

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      px: 2, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
      <Typography variant="caption" color="text.secondary">
        Showing {start}–{end} of {totalElements}
      </Typography>
      <MuiPagination
        count={totalPages}
        page={currentPage + 1}
        onChange={(_, p) => onPageChange(p - 1)}
        size="small"
        color="primary"
        shape="rounded"
      />
    </Box>
  );
}