import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Box, Divider, Toolbar, IconButton, Tooltip
} from "@mui/material";
import {
  Dashboard, Layers, People, MenuBook, Person,
  ExpandMore, ExpandLess, Storage,
  HowToReg, ChevronLeft, ChevronRight
} from "@mui/icons-material";
import Navbar from "./Navbar.jsx";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isMasterPath = ["/batches", "/students", "/courses", "/instructors"].some(p =>
    location.pathname.startsWith(p)
  );
  const [masterOpen, setMasterOpen] = useState(isMasterPath);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const NavItem = ({ icon, label, path }) => {
    const button = (
      <ListItemButton
        selected={isActive(path)}
        onClick={() => navigate(path)}
        sx={{
          mx: 1,
          borderRadius: 2,
          mb: 0.5,
          justifyContent: collapsed ? "center" : "flex-start",
          px: collapsed ? 1.5 : 2,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 36,
            justifyContent: "center",
            color: isActive(path) ? "primary.main" : "text.secondary",
          }}
        >
          {icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={label}
            primaryTypographyProps={{ fontSize: 14, fontWeight: isActive(path) ? 600 : 400 }}
          />
        )}
      </ListItemButton>
    );

    return collapsed ? (
      <Tooltip title={label} placement="right">
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
        // IMPORTANT: no position:"fixed" / top override here.
        // For variant="permanent", the paper element IS the drawer root —
        // forcing it to position:fixed pulls it OUT of the flex layout
        // entirely, so the sibling <main> Box can no longer reliably
        // reserve/track its width as it animates between collapsed and
        // expanded. Letting MUI keep its default (paper stays in normal
        // flex flow) is what keeps the two in sync at every width.
        "& .MuiDrawer-paper": {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          boxSizing: "border-box",
          overflowX: "hidden",
          borderRight: "1px solid",
          borderColor: "divider",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
      }}
    >
      {/* Spacer so sidebar content starts below the fixed Navbar/AppBar —
          same trick used for the <main> content area below. */}
      <Toolbar />

      <Box sx={{ overflow: "auto", overflowX: "hidden", pt: 2, pb: 2, flexGrow: 1 }}>

        {/* Navigation */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            px: collapsed ? 0 : 2.5,
          }}
        >
          {!collapsed && (
            <Typography variant="caption" sx={{ color: "text.disabled",
              fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
              Navigation
            </Typography>
          )}
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{
              width: 24,
              height: 24,
              border: "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            {collapsed ? <ChevronRight sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>

        <List dense sx={{ mt: 1 }}>
          <NavItem icon={<Dashboard fontSize="small" />} label="Dashboard" path="/dashboard" />
        </List>

        <Divider sx={{ my: 1, mx: 2 }} />

        {/* Manage */}
        {!collapsed && (
          <Typography variant="caption" sx={{ px: 2.5, color: "text.disabled",
            fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
            Manage
          </Typography>
        )}

        <List dense sx={{ mt: 1 }}>
          <ListItemButton
            onClick={() => !collapsed && setMasterOpen(!masterOpen)}
            sx={{
              mx: 1,
              borderRadius: 2,
              mt: 0.5,
              mb: 0.5,
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 1.5 : 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: "center", color: "text.secondary" }}>
              <Storage fontSize="small" />
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText primary="Master"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                {masterOpen
                  ? <ExpandLess fontSize="small" sx={{ color: "text.secondary" }} />
                  : <ExpandMore fontSize="small" sx={{ color: "text.secondary" }} />}
              </>
            )}
          </ListItemButton>

          <Collapse in={masterOpen && !collapsed} timeout="auto" unmountOnExit>
            <List dense disablePadding sx={{ pl: 2 }}>
              <NavItem icon={<Layers fontSize="small" />}   label="Batches"     path="/batches" />
              <NavItem icon={<People fontSize="small" />}   label="Students"    path="/students" />
              <NavItem icon={<MenuBook fontSize="small" />} label="Courses"     path="/courses" />
              <NavItem icon={<Person fontSize="small" />}   label="Instructors" path="/instructors" />
              <NavItem icon={<HowToReg fontSize="small" />} label="Enrollment"  path="/enrollment" />
            </List>
          </Collapse>

          {/* When collapsed, show master's children as flat icons instead of accordion */}
          {collapsed && (
            <>
              <NavItem icon={<Layers fontSize="small" />}   label="Batches"     path="/batches" />
              <NavItem icon={<People fontSize="small" />}   label="Students"    path="/students" />
              <NavItem icon={<MenuBook fontSize="small" />} label="Courses"     path="/courses" />
              <NavItem icon={<Person fontSize="small" />}   label="Instructors" path="/instructors" />
              <NavItem icon={<HowToReg fontSize="small" />} label="Enrollment"  path="/enrollment" />
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
    <Box sx={{ display: "flex" }}>
      <Navbar />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}