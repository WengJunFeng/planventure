import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveTokens } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      saveTokens(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="pv-page-enter"
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        background: "var(--pv-cream)",
      }}
    >
      {/* Left decorative panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "44%",
          flexShrink: 0,
          background: "linear-gradient(160deg, #1C1A17 0%, #2E2A22 50%, #3A6351 100%)",
          flexDirection: "column",
          justifyContent: "flex-end",
          p: 6,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Abstract circle decorations */}
        <Box sx={{
          position: "absolute", top: -80, right: -80,
          width: 320, height: 320, borderRadius: "50%",
          border: "1px solid rgba(193,123,47,0.20)",
        }} />
        <Box sx={{
          position: "absolute", top: 40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          border: "1px solid rgba(193,123,47,0.12)",
        }} />
        <Box sx={{
          position: "absolute", bottom: 120, left: -60,
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(193,123,47,0.12) 0%, transparent 70%)",
        }} />

        {/* Quote */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.75rem",
              fontWeight: 600,
              color: "#FEFAF4",
              lineHeight: 1.35,
              mb: 2,
            }}
          >
            "Not all those who wander are lost."
          </Typography>
          <Typography sx={{ color: "rgba(254,250,244,0.50)", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
            — J.R.R. Tolkien
          </Typography>
        </Box>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 5 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", mb: 1, letterSpacing: "0.12em", fontSize: "0.72rem" }}
            >
              Welcome back
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1.1,
                mb: 1,
              }}
            >
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Continue planning your next adventure.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.4, mt: 0.5, fontSize: "0.95rem" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </Box>

          {/* Divider */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: 1, background: "var(--pv-border)" }} />
            <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: "0.08em" }}>
              OR
            </Typography>
            <Box sx={{ flex: 1, height: 1, background: "var(--pv-border)" }} />
          </Box>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Don&apos;t have an account?{" "}
            <Link
              component={RouterLink}
              to="/register"
              sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none",
                "&:hover": { textDecoration: "underline" } }}
            >
              Create one for free
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
