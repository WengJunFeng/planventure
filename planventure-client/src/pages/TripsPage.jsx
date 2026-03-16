import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { getTrips } from "../api/trips";

// Destination-based gradient palette for card accents
const CARD_ACCENTS = [
  "linear-gradient(135deg, #C17B2F 0%, #D9944A 100%)",
  "linear-gradient(135deg, #3A6351 0%, #4E8068 100%)",
  "linear-gradient(135deg, #7B5EA7 0%, #9B7EC8 100%)",
  "linear-gradient(135deg, #B94040 0%, #D05555 100%)",
  "linear-gradient(135deg, #1D6FA4 0%, #3391C8 100%)",
  "linear-gradient(135deg, #8A6D2F 0%, #B08A45 100%)",
];

function TripCard({ trip, index, onClick }) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  // Get initials / first 2 chars of destination for decorative display
  const initials = (trip.destination || "??")
    .split(/[\s,]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#FEFAF4",
        overflow: "hidden",
        borderRadius: "8px",
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        {/* Coloured accent top strip */}
        <Box
          sx={{
            background: accent,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Large decorative initials */}
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "3.5rem",
              color: "rgba(255,255,255,0.18)",
              lineHeight: 1,
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              userSelect: "none",
              letterSpacing: "-0.04em",
            }}
          >
            {initials}
          </Typography>

          {/* Pin dot */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </Box>
        </Box>

        {/* Card body */}
        <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "text.primary",
              mb: 0.75,
            }}
          >
            {trip.destination}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 18,
                height: 1.5,
                background: accent,
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getTrips()
      .then((res) => setTrips(res.data))
      .catch(() => setError("Failed to load trips."));
  }, []);

  return (
    <Box
      className="pv-page-enter"
      sx={{ minHeight: "calc(100vh - 64px)", background: "var(--pv-cream)", pb: 10 }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 } }}>

        {/* Page header */}
        <Box sx={{ mb: { xs: 5, md: 7 } }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "primary.main",
              mb: 1,
              letterSpacing: "0.12em",
              fontSize: "0.72rem",
            }}
          >
            Your adventures
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1.1,
              }}
            >
              My Trips
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/trips/new")}
              sx={{ mb: 0.5 }}
            >
              New Trip
            </Button>
          </Box>
          {/* Decorative rule */}
          <Box
            sx={{
              mt: 2.5,
              height: 1,
              background: "linear-gradient(90deg, #C17B2F 0%, rgba(193,123,47,0.15) 40%, transparent 100%)",
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Empty state */}
        {trips.length === 0 && !error && (
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 10, md: 14 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(193,123,47,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#C17B2F">
                <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z" />
              </svg>
            </Box>
            <Typography
              variant="h5"
              sx={{ fontFamily: "'Playfair Display', serif", color: "text.primary" }}
            >
              No trips yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
              Start planning your next adventure — create your first trip and
              let the journey begin.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/trips/new")}
              sx={{ mt: 1 }}
            >
              Create your first trip
            </Button>
          </Box>
        )}

        {/* Trip grid */}
        {trips.length > 0 && (
          <Grid container spacing={3} className="pv-card-stagger">
            {trips.map((trip, idx) => (
              <Grid item xs={12} sm={6} md={4} key={trip.id}>
                <TripCard
                  trip={trip}
                  index={idx}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* FAB */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 36, right: 36 }}
        onClick={() => navigate("/trips/new")}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
