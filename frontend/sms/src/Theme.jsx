// import { createTheme } from "@mui/material/styles";

// const theme = createTheme({
//   palette: {
//     mode: "light",
//     primary: {
//       main: "#1976d2",
//     },
//     secondary: {
//       main: "#dc004e",
//     },
//   },
//   typography: {
//     fontFamily: "'DM Sans', 'Roboto', sans-serif",
//   },
// });

// export default theme;

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "'DM Sans', 'Roboto', sans-serif",
    h4: { fontWeight: 700, color: "#1976d2" },
    h5: { fontWeight: 700, color: "#1976d2" },
    h6: { fontWeight: 700, color: "#1976d2" },
  },
  components: {
    // Table headers: no wrapping, uppercase, subtle gray background —
    // this is what fixes "Student Name" / "Fee Status" breaking onto two
    // lines and throwing off row alignment.
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#374151",
          background: "#F9FAFB",
          whiteSpace: "nowrap",
        },
        body: {
          verticalAlign: "middle",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

export default theme;