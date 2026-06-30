import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Box, Divider
} from "@mui/material";
import {
  Dashboard, Layers, People, MenuBook, Person,
  ExpandMore, ExpandLess, Storage, HowToReg
} from "@mui/icons-material";

const DRAWER_WIDTH = 240;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isMasterPath = ["/batches", "/students", "/courses", "/instructors"].some(p =>
    location.pathname.startsWith(p)
  );
  const [masterOpen, setMasterOpen] = useState(isMasterPath);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const NavItem = ({ icon, label, path }) => (
    <ListItemButton
      selected={isActive(path)}
      onClick={() => navigate(path)}
      sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: isActive(path) ? "primary.main" : "text.secondary" }}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{ fontSize: 14, fontWeight: isActive(path) ? 600 : 400 }}
      />
    </ListItemButton>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          top: 64,
        },
      }}
    >
      <Box sx={{ overflow: "auto", pt: 2, pb: 2 }}>

        {/* ── Navigation Section ── */}
        <Typography
          variant="caption"
          sx={{ px: 2.5, color: "text.disabled", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}
        >
          Navigation
        </Typography>

        <List dense sx={{ mt: 1 }}>
          <NavItem icon={<Dashboard fontSize="small" />} label="Dashboard" path="/dashboard" />
        </List>

        <Divider sx={{ my: 1, mx: 2 }} />

        {/* ── Manage Section ── */}
        <Typography
          variant="caption"
          sx={{ px: 2.5, color: "text.disabled", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}
        >
          Manage
        </Typography>

        <List dense sx={{ mt: 1 }}>

          {/* Master accordion */}
          <ListItemButton
            onClick={() => setMasterOpen(!masterOpen)}
            sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
              <Storage fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Master"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
            {masterOpen
              ? <ExpandLess fontSize="small" sx={{ color: "text.secondary" }} />
              : <ExpandMore fontSize="small" sx={{ color: "text.secondary" }} />
            }
          </ListItemButton>

          {/* Submenu — Batches, Students, Courses, Instructors */}
          <Collapse in={masterOpen} timeout="auto" unmountOnExit>
            <List dense disablePadding sx={{ pl: 2 }}>
              <NavItem icon={<Layers fontSize="small" />}   label="Batches"     path="/batches" />
              <NavItem icon={<People fontSize="small" />}   label="Students"    path="/students" />
              <NavItem icon={<MenuBook fontSize="small" />} label="Courses"     path="/courses" />
              <NavItem icon={<Person fontSize="small" />}   label="Instructors" path="/instructors" />
              <NavItem icon={<HowToReg fontSize="small" />} label="Enrollment" path="/enrollment" />
            </List>
          </Collapse>

          {/* Enrollment — standalone item */}
          <NavItem icon={<HowToReg fontSize="small" />} label="Enrollment" path="/enrollment" />

        </List>
      </Box>
    </Drawer>
  );
}