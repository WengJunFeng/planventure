import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#C17B2F",       // warm amber-gold
      light: "#D9944A",
      dark: "#9A5E1C",
      contrastText: "#FEFAF4",
    },
    secondary: {
      main: "#3A6351",       // deep forest green
      light: "#4E8068",
      dark: "#2A4A3C",
      contrastText: "#FEFAF4",
    },
    error: {
      main: "#B94040",
    },
    background: {
      default: "#F7F3EC",    // warm off-white parchment
      paper: "#FEFAF4",      // slightly lighter paper
    },
    text: {
      primary: "#1C1A17",
      secondary: "#6B6358",
      disabled: "#B0A898",
    },
    divider: "#E5DDD0",
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    subtitle1: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 500,
      fontSize: "0.8125rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    body1: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "1rem",
      lineHeight: 1.65,
    },
    body2: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    button: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "none",
    },
    caption: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.75rem",
      letterSpacing: "0.06em",
    },
  },
  shape: {
    borderRadius: 4,
  },
  shadows: [
    "none",
    "0 1px 3px rgba(28,26,23,0.06), 0 1px 2px rgba(28,26,23,0.04)",
    "0 2px 8px rgba(28,26,23,0.08), 0 1px 3px rgba(28,26,23,0.05)",
    "0 4px 16px rgba(28,26,23,0.10), 0 2px 6px rgba(28,26,23,0.06)",
    "0 6px 24px rgba(28,26,23,0.12), 0 3px 8px rgba(28,26,23,0.07)",
    "0 8px 32px rgba(28,26,23,0.14), 0 4px 12px rgba(28,26,23,0.08)",
    ...Array(19).fill("none"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F7F3EC",
          overflowX: "hidden",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "#FEFAF4",
          borderBottom: "1px solid #E5DDD0",
          color: "#1C1A17",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: "10px 22px",
          fontSize: "0.875rem",
          transition: "all 0.2s ease",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(193,123,47,0.30)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": { borderWidth: "1.5px" },
        },
        sizeSmall: {
          padding: "6px 14px",
          fontSize: "0.8125rem",
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 2 },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #E5DDD0",
          transition: "all 0.25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 40px rgba(28,26,23,0.14)",
            borderColor: "#C17B2F",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(28,26,23,0.08), 0 1px 3px rgba(28,26,23,0.05)",
          border: "1px solid #E5DDD0",
        },
        elevation2: {
          boxShadow: "0 4px 16px rgba(28,26,23,0.10), 0 2px 6px rgba(28,26,23,0.06)",
          border: "1px solid #E5DDD0",
        },
        elevation3: {
          boxShadow: "0 6px 24px rgba(28,26,23,0.12), 0 3px 8px rgba(28,26,23,0.07)",
          border: "1px solid #E5DDD0",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 4,
            backgroundColor: "#FEFAF4",
            transition: "box-shadow 0.2s ease",
            "& fieldset": { borderColor: "#D5C9BC", borderWidth: "1.5px" },
            "&:hover fieldset": { borderColor: "#C17B2F" },
            "&.Mui-focused fieldset": {
              borderColor: "#C17B2F",
              boxShadow: "0 0 0 3px rgba(193,123,47,0.12)",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: "#C17B2F" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: "0.78rem",
        },
        outlinedPrimary: {
          borderColor: "#C17B2F",
          color: "#C17B2F",
        },
        filledPrimary: {
          backgroundColor: "#C17B2F",
          color: "#FEFAF4",
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(193,123,47,0.35)",
          "&:hover": {
            boxShadow: "0 6px 28px rgba(193,123,47,0.45)",
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "#E5DDD0" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
  },
});

export default theme;
