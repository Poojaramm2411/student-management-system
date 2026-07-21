import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem,
  ListItemIcon, Divider, IconButton, Tooltip, Chip
} from "@mui/material";
import { Logout, Person, School, AdminPanelSettings } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const [anchor, setAnchor] = useState(null);
  const { handleLogout, admin } = useAuth();
  
  const initials = admin?.name
    ? admin.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #E2E8F0",
        color: "#0F172A",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
            }}
          >
            <School sx={{ fontSize: 22, color: "#FFFFFF" }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" fontWeight={800} letterSpacing={-0.4} sx={{ fontSize: 20 }}>
              Student<Box component="span" sx={{ color: "#4F46E5" }}>MS</Box>
            </Typography>
            <Chip
              label="ADMIN"
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(79, 70, 229, 0.1)",
                color: "#4F46E5",
                borderRadius: 1,
                px: 0.5,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Account menu">
            <IconButton
              onClick={(e) => setAnchor(e.currentTarget)}
              size="small"
              sx={{
                p: 0.5,
                border: "2px solid",
                borderColor: anchor ? "#4F46E5" : "transparent",
                transition: "all 0.2s ease",
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
                  boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                }}
              >
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 3,
                border: "1px solid #E2E8F0",
                p: 0.5,
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                {admin?.name || "System Admin"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {admin?.email || "admin@citpl.com"}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => setAnchor(null)} sx={{ borderRadius: 1.5, py: 1 }}>
              <ListItemIcon><AdminPanelSettings fontSize="small" sx={{ color: "#4F46E5" }} /></ListItemIcon>
              Admin Controls
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ borderRadius: 1.5, py: 1, color: "error.main" }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: "error.main" }} /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}