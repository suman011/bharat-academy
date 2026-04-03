import { createTheme } from "@mui/material/styles";

/** Aligns MUI with site tokens (see index.css :root). */
export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4f46e5", dark: "#4338ca" },
    secondary: { main: "#7c3aed" },
    text: { primary: "#0f172a", secondary: "#64748b" },
    background: { default: "#f4f6fb", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
  },
});
