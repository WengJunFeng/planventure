import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
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
      const res = await register(email, password);
      saveTokens(res.data);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
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
      {/* Right decorative panel (appears on left for register) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "44%",
          flexShrink: 0,
          background: "linear-gradient(160deg, #1C1A17 0%, #2A1C10 50%, #C17B2F 160%)",
          flexDirection: "column",
          justifyContent: "flex-end",
          p: 6,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative map grid lines */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: `${(i + 1) * 14}%`,
              left: 0, right: 0,
              height: "1px",
              background: "rgba(193,123,47,0.10)",
            }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              left: `${(i + 1) * 18}%`,
              top: 0, bottom: 0,
              width: "1px",
              background: "rgba(193,123,47,0.10)",
            }}
          />
        ))}
        {/* Glow */}
        <Box sx={{
          position: "absolute", bottom: -40, right: -40,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(193,123,47,0.20) 0%, transparent 70%)",
        }} />

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
            "The world is a book. Those who do not travel read only one page."
          </Typography>
          <Typography sx={{ color: "rgba(254,250,244,0.50)", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
            — Saint Augustine
          </Typography>
        </Box>
      </Box>

      {/* Form panel */}
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
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", mb: 1, letterSpacing: "0.12em", fontSize: "0.72rem" }}
            >
              Start your journey
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
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join PlanVenture and start exploring.
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
              helperText="Min 8 chars · include uppercase, number & symbol"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.4, mt: 0.5, fontSize: "0.95rem" }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: 1, background: "var(--pv-border)" }} />
            <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: "0.08em" }}>
              OR
            </Typography>
            <Box sx={{ flex: 1, height: 1, background: "var(--pv-border)" }} />
          </Box>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none",
                "&:hover": { textDecoration: "underline" } }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
