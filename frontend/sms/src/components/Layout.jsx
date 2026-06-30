import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Box, Divider, Toolbar
} from "@mui/material";
import {
  Dashboard, Layers, People, MenuBook, Person,
  ExpandMore, ExpandLess, Storage,
  HowToReg
} from "@mui/icons-material";
import Navbar from "./Navbar.jsx";

const DRAWER_WIDTH = 240;

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ batches added to master path
  const isMasterPath = ["/batches", "/students", "/courses", "/instructors"].some(p =>
    location.pathname.startsWith(p)
  );
  const [masterOpen, setMasterOpen] = useState(isMasterPath);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const NavItem = ({ icon, label, path }) => (
    <ListItemButton selected={isActive(path)} onClick={() => navigate(path)}
      sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 36, color: isActive(path) ? "primary.main" : "text.secondary" }}>
        {icon}
      </ListItemIcon>
      <ListItemText primary={label}
        primaryTypographyProps={{ fontSize: 14, fontWeight: isActive(path) ? 600 : 400 }} />
    </ListItemButton>
  );

  return (
    <Drawer variant="permanent" sx={{
      width: DRAWER_WIDTH, flexShrink: 0,
      "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", top: 64 }
    }}>
      <Box sx={{ overflow: "auto", pt: 2, pb: 2 }}>

        {/* Navigation */}
        <Typography variant="caption" sx={{ px: 2.5, color: "text.disabled",
          fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
          Navigation
        </Typography>

        <List dense sx={{ mt: 1 }}>
          {/* ✅ Dashboard only — Batches removed from here */}
          <NavItem icon={<Dashboard fontSize="small" />} label="Dashboard" path="/dashboard" />
        </List>

        <Divider sx={{ my: 1, mx: 2 }} />

        {/* Manage */}
        <Typography variant="caption" sx={{ px: 2.5, color: "text.disabled",
          fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
          Manage
        </Typography>

        <List dense sx={{ mt: 1 }}>
          <ListItemButton onClick={() => setMasterOpen(!masterOpen)}
            sx={{ mx: 1, borderRadius: 2, mt: 0.5, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
              <Storage fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Master"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
            {masterOpen
              ? <ExpandLess fontSize="small" sx={{ color: "text.secondary" }} />
              : <ExpandMore fontSize="small" sx={{ color: "text.secondary" }} />}
          </ListItemButton>

          <Collapse in={masterOpen} timeout="auto" unmountOnExit>
            <List dense disablePadding sx={{ pl: 2 }}>
              {/* ✅ Batches now inside Master */}
              <NavItem icon={<Layers fontSize="small" />}   label="Batches"     path="/batches" />
              <NavItem icon={<People fontSize="small" />}   label="Students"    path="/students" />
              <NavItem icon={<MenuBook fontSize="small" />} label="Courses"     path="/courses" />
              <NavItem icon={<Person fontSize="small" />}   label="Instructors" path="/instructors" />
              <NavItem icon={<HowToReg fontSize="small" />} label="Enrollment"  path="/enrollment" />
            </List>
          </Collapse>
        </List>

      </Box>
    </Drawer>
  );
}

export default function Layout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}