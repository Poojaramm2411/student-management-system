import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Box, Divider, Toolbar, IconButton, Tooltip
} from "@mui/material";
import {
  Dashboard, Layers, People, MenuBook, Person,
  ExpandMore, ExpandLess, Storage,
  HowToReg, ChevronLeft, ChevronRight, Assignment
} from "@mui/icons-material";
import Navbar from "./Navbar.jsx";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isMasterPath = ["/batches", "/students", "/courses", "/instructors", "/assignments", "/enrollment"].some(p =>
    location.pathname.startsWith(p)
  );
  const [masterOpen, setMasterOpen] = useState(isMasterPath);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const NavItem = ({ icon, label, path }) => {
    const active = isActive(path);

    const button = (
      <ListItemButton
        selected={active}
        onClick={() => navigate(path)}
        sx={{
          mx: 1,
          borderRadius: 2.5,
          mb: 0.5,
          justifyContent: collapsed ? "center" : "flex-start",
          px: collapsed ? 1.5 : 2,
          py: 1,
          transition: "all 0.2s ease",
          borderLeft: active ? "3px solid #4F46E5" : "3px solid transparent",
          background: active
            ? "linear-gradient(90deg, rgba(79, 70, 229, 0.12) 0%, rgba(79, 70, 229, 0.02) 100%)"
            : "transparent",
          "&.Mui-selected": {
            background: "linear-gradient(90deg, rgba(79, 70, 229, 0.12) 0%, rgba(79, 70, 229, 0.02) 100%)",
            "&:hover": {
              background: "linear-gradient(90deg, rgba(79, 70, 229, 0.18) 0%, rgba(79, 70, 229, 0.04) 100%)",
            },
          },
          "&:hover": {
            backgroundColor: active ? undefined : "#F1F5F9",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 36,
            justifyContent: "center",
            color: active ? "#4F46E5" : "#64748B",
          }}
        >
          {icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontSize: 13.5,
              fontWeight: active ? 700 : 500,
              color: active ? "#4F46E5" : "#334155",
            }}
          />
        )}
      </ListItemButton>
    );

    return collapsed ? (
      <Tooltip title={label} placement="right" arrow>
        {button}
      </Tooltip>
    ) : (
      button
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        "& .MuiDrawer-paper": {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          boxSizing: "border-box",
          overflowX: "hidden",
          borderRight: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
      }}
    >
      <Toolbar />

      <Box sx={{ overflow: "auto", overflowX: "hidden", pt: 2, pb: 2, flexGrow: 1 }}>

        {/* Section Title & Collapse Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            px: collapsed ? 0 : 2.5,
            mb: 1,
          }}
        >
          {!collapsed && (
            <Typography variant="caption" sx={{ color: "#94A3B8",
              fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", fontSize: 10 }}>
              Main Navigation
            </Typography>
          )}
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{
              width: 26,
              height: 26,
              border: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              "&:hover": { bgcolor: "#EEF2FF", borderColor: "#818CF8" },
            }}
          >
            {collapsed ? <ChevronRight sx={{ fontSize: 16, color: "#4F46E5" }} /> : <ChevronLeft sx={{ fontSize: 16, color: "#64748B" }} />}
          </IconButton>
        </Box>

        <List dense sx={{ px: 0 }}>
          <NavItem icon={<Dashboard fontSize="small" />} label="Dashboard" path="/dashboard" />
        </List>

        <Divider sx={{ my: 1.5, mx: 2, borderColor: "#F1F5F9" }} />

        {/* Manage Section Header */}
        {!collapsed && (
          <Typography variant="caption" sx={{ px: 2.5, color: "#94A3B8",
            fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", fontSize: 10 }}>
            Management
          </Typography>
        )}

        <List dense sx={{ mt: 0.5, px: 0 }}>
          <ListItemButton
            onClick={() => !collapsed && setMasterOpen(!masterOpen)}
            sx={{
              mx: 1,
              borderRadius: 2.5,
              mt: 0.5,
              mb: 0.5,
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 1.5 : 2,
              py: 1,
              "&:hover": { backgroundColor: "#F1F5F9" },
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: "center", color: "#64748B" }}>
              <Storage fontSize="small" />
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText
                  primary="Master Modules"
                  primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}
                />
                {masterOpen
                  ? <ExpandLess fontSize="small" sx={{ color: "#64748B" }} />
                  : <ExpandMore fontSize="small" sx={{ color: "#64748B" }} />}
              </>
            )}
          </ListItemButton>

          <Collapse in={masterOpen && !collapsed} timeout="auto" unmountOnExit>
            <List dense disablePadding sx={{ pl: 1 }}>
              <NavItem icon={<Layers fontSize="small" />}     label="Batches"       path="/batches" />
              <NavItem icon={<People fontSize="small" />}     label="Students"      path="/students" />
              <NavItem icon={<MenuBook fontSize="small" />}   label="Courses"       path="/courses" />
              <NavItem icon={<Person fontSize="small" />}     label="Instructors"   path="/instructors" />
              <NavItem icon={<Assignment fontSize="small" />} label="Assignments"   path="/assignments" />
              <NavItem icon={<HowToReg fontSize="small" />}   label="Enrollment"     path="/enrollment" />
            </List>
          </Collapse>

          {collapsed && (
            <>
              <NavItem icon={<Layers fontSize="small" />}     label="Batches"       path="/batches" />
              <NavItem icon={<People fontSize="small" />}     label="Students"      path="/students" />
              <NavItem icon={<MenuBook fontSize="small" />}   label="Courses"       path="/courses" />
              <NavItem icon={<Person fontSize="small" />}     label="Instructors"   path="/instructors" />
              <NavItem icon={<Assignment fontSize="small" />} label="Assignments"   path="/assignments" />
              <NavItem icon={<HowToReg fontSize="small" />}   label="Enrollment"     path="/enrollment" />
            </>
          )}
        </List>

      </Box>
    </Drawer>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <Navbar />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2.5, md: 3.5 }, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}