import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem,
  ListItemIcon, Divider, IconButton, Tooltip
} from "@mui/material";
import { Logout, Person, School } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";

export default function Navbar({ drawerWidth = 240 }) {
  const [anchor, setAnchor] = useState(null);
  const { handleLogout, admin } = useAuth();
  const initials = admin?.name
    ? admin.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: "linear-gradient(135deg,#6366f1,#06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <School sx={{ fontSize: 20, color: "#fff" }} />
          </Box>
          <Typography variant="h6" fontWeight={700} letterSpacing={-0.3}>
            Student<Box component="span" sx={{ color: "primary.main" }}>MS</Box>
          </Typography>
        </Box>

        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
            <Avatar sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 700,
              background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}>
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
          PaperProps={{ sx: { mt: 1, minWidth: 160 } }}>
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              {admin?.name || "Admin"}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setAnchor(null)}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon><Logout fontSize="small" sx={{ color: "error.main" }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}