import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ColorModeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem("sms-theme-mode") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sms-theme-mode", mode);
    } catch {
      /* ignore storage errors (e.g. private browsing) */
    }
  }, [mode]);

  const toggleColorMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#4F46E5" },
          secondary: { main: "#7C3AED" },
          background: {
            default: mode === "dark" ? "#0B1120" : "#F8FAFC",
            paper: mode === "dark" ? "#111827" : "#FFFFFF",
          },
          text: {
            primary: mode === "dark" ? "#F1F5F9" : "#0F172A",
            secondary: mode === "dark" ? "#94A3B8" : "#64748B",
          },
          divider: mode === "dark" ? "#1E293B" : "#E2E8F0",
        },
        shape: { borderRadius: 10 },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}