import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 4, md: 6 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand wordmark */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            cursor: "pointer",
            userSelect: "none",
            "&:hover .pv-logo-dot": { transform: "scale(1.4)" },
          }}
        >
          {/* Decorative compass-dot icon */}
          <Box
            className="pv-logo-dot"
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C17B2F 0%, #D9944A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "transform 0.2s ease",
              boxShadow: "0 2px 8px rgba(193,123,47,0.30)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.5 5.5H13L9.5 8.5L11 13L7 10L3 13L4.5 8.5L1 5.5H5.5L7 1Z"
                fill="#FEFAF4" />
            </svg>
          </Box>
          <Typography
            component="span"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              color: "text.primary",
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            Plan
            <Box component="span" sx={{ color: "primary.main" }}>
              venture
            </Box>
          </Typography>
        </Box>

        {/* Nav right */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isAuthenticated ? (
            <>
              <Button
                onClick={() => navigate("/")}
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  "&:hover": { color: "text.primary", background: "transparent" },
                }}
              >
                My Trips
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleLogout}
                sx={{ ml: 0.5 }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  "&:hover": { color: "text.primary", background: "transparent" },
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/register")}
                sx={{ ml: 0.5 }}
              >
                Get started
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
