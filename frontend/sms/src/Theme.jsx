import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4F46E5",
      light: "#818CF8",
      dark: "#3730A3",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#06B6D4",
      light: "#67E8F9",
      dark: "#0891B2",
    },
    warning: {
      main: "#F59E0B",
      light: "#FCD34D",
      dark: "#D97706",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
      disabled: "#94A3B8",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: "'Outfit', 'DM Sans', 'Roboto', sans-serif",
    h4: { fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" },
    h5: { fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" },
    h6: { fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" },
    subtitle1: { fontWeight: 600, color: "#1E293B" },
    body1: { color: "#334155" },
    body2: { color: "#64748B" },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#475569",
          background: "#F1F5F9",
          whiteSpace: "nowrap",
          borderBottom: "1px solid #E2E8F0",
        },
        body: {
          verticalAlign: "middle",
          borderColor: "#F1F5F9",
          fontSize: 13.5,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          padding: "8px 18px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)",
            boxShadow: "0 6px 16px rgba(79, 70, 229, 0.35)",
            transform: "translateY(-1px)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            boxShadow: "0 6px 16px rgba(16, 185, 129, 0.35)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderColor: "#CBD5E1",
          color: "#334155",
          "&:hover": {
            borderColor: "#6366F1",
            backgroundColor: "#EEF2FF",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
        outlined: {
          borderColor: "#E2E8F0",
        },
        elevation1: {
          boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
        },
        elevation2: {
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          borderColor: "#E2E8F0",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
          fontSize: 12,
        },
        sizeSmall: {
          fontSize: 11,
          height: 24,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          borderColor: "#E2E8F0",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#818CF8",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4F46E5",
            borderWidth: "2px",
          },
        },
      },
    },
  },
});

export default theme;