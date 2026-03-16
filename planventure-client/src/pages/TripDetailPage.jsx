import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { getTrip, deleteTrip } from "../api/trips";
import { getPlans, generatePlans, deletePlan } from "../api/plans";

const formatDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

function PlanItem({ plan, onDelete }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 0,
        py: 0,
        "&:hover .plan-delete-btn": { opacity: 1 },
      }}
    >
      {/* Timeline column */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 40,
          flexShrink: 0,
          pt: "18px",
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C17B2F, #D9944A)",
            flexShrink: 0,
            boxShadow: "0 0 0 3px rgba(193,123,47,0.15)",
          }}
        />
        <Box sx={{ flex: 1, width: 1.5, background: "var(--pv-border)", mt: 0.5 }} />
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          py: 2,
          pr: 1,
          pb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.75 }}>
              {plan.plan_time && (
                <Chip
                  label={plan.plan_time}
                  size="small"
                  sx={{
                    background: "rgba(193,123,47,0.10)",
                    color: "#C17B2F",
                    border: "1px solid rgba(193,123,47,0.25)",
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    letterSpacing: "0.04em",
                    height: 22,
                  }}
                />
              )}
              {plan.plan_traffic && (
                <Chip
                  label={plan.plan_traffic}
                  size="small"
                  sx={{
                    background: "rgba(58,99,81,0.08)",
                    color: "#3A6351",
                    border: "1px solid rgba(58,99,81,0.20)",
                    fontWeight: 500,
                    fontSize: "0.72rem",
                    height: 22,
                  }}
                />
              )}
            </Box>

            <Typography
              variant="body1"
              sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.45, mb: 0.5 }}
            >
              {plan.plan_activity}
            </Typography>

            {(plan.plan_location_from || plan.plan_location_to) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5, flexWrap: "wrap" }}>
                {plan.plan_location_from && (
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                    {plan.plan_location_from}
                  </Typography>
                )}
                {plan.plan_location_from && plan.plan_location_to && (
                  <Box sx={{ width: 14, height: 1, background: "var(--pv-border)", flexShrink: 0 }} />
                )}
                {plan.plan_location_to && (
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                    {plan.plan_location_to}
                  </Typography>
                )}
              </Box>
            )}

            {plan.plan_note && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  color: "text.secondary",
                  fontSize: "0.82rem",
                  fontStyle: "italic",
                  lineHeight: 1.55,
                }}
              >
                {plan.plan_note}
              </Typography>
            )}
          </Box>

          {/* Delete */}
          <Tooltip title="Remove activity">
            <IconButton
              className="plan-delete-btn"
              size="small"
              onClick={() => onDelete(plan.id)}
              sx={{
                opacity: 0,
                transition: "opacity 0.15s ease",
                color: "text.disabled",
                "&:hover": { color: "error.main", background: "rgba(185,64,64,0.07)" },
                flexShrink: 0,
              }}
            >
              <DeleteIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([getTrip(id), getPlans(id)])
      .then(([tripRes, plansRes]) => {
        setTrip(tripRes.data);
        setPlans(plansRes.data);
      })
      .catch(() => setError("Failed to load trip."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await deleteTrip(id);
      navigate("/");
    } catch {
      setError("Failed to delete trip.");
    }
  };

  const handleGenerate = async () => {
    const replace =
      plans.length > 0
        ? window.confirm("Replace existing plans with the default template?")
        : false;
    setGenerating(true);
    try {
      const res = await generatePlans(id, replace);
      setPlans(res.data);
    } catch {
      setError("Failed to generate itinerary.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await deletePlan(id, planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch {
      setError("Failed to delete plan.");
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 64px)",
          background: "var(--pv-cream)",
        }}
      >
        <CircularProgress sx={{ color: "primary.main" }} size={36} thickness={3} />
      </Box>
    );

  if (!trip)
    return (
      <Container sx={{ mt: 6 }}>
        <Alert severity="error">Trip not found.</Alert>
      </Container>
    );

  return (
    <Box
      className="pv-page-enter"
      sx={{ minHeight: "calc(100vh - 64px)", background: "var(--pv-cream)", pb: 10 }}
    >
      {/* Hero header */}
      <Box
        sx={{
          background: "linear-gradient(160deg, #1C1A17 0%, #2E2A22 60%, #3A3020 100%)",
          pt: { xs: 5, md: 7 },
          pb: { xs: 5, md: 6 },
          px: { xs: 3, sm: 4, md: 6 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative circles */}
        <Box sx={{
          position: "absolute", top: -60, right: -60,
          width: 300, height: 300, borderRadius: "50%",
          border: "1px solid rgba(193,123,47,0.15)",
          pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute", bottom: -80, right: 80,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(193,123,47,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Back */}
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: "0.95rem !important" }} />}
            onClick={() => navigate("/")}
            sx={{
              mb: 4,
              color: "rgba(254,250,244,0.55)",
              fontWeight: 500,
              fontSize: "0.82rem",
              p: 0,
              "&:hover": { color: "#FEFAF4", background: "transparent" },
            }}
          >
            All trips
          </Button>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(193,123,47,0.90)",
                  mb: 1,
                  letterSpacing: "0.12em",
                  fontSize: "0.72rem",
                }}
              >
                Destination
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  color: "#FEFAF4",
                  lineHeight: 1.05,
                  mb: 1.5,
                  fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
                }}
              >
                {trip.destination}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <Typography sx={{ color: "rgba(254,250,244,0.60)", fontSize: "0.875rem" }}>
                  {formatDate(trip.start_date)}
                </Typography>
                <Box sx={{ width: 20, height: 1, background: "rgba(193,123,47,0.5)" }} />
                <Typography sx={{ color: "rgba(254,250,244,0.60)", fontSize: "0.875rem" }}>
                  {formatDate(trip.end_date)}
                </Typography>
              </Box>
              {trip.latitude && (
                <Typography sx={{ color: "rgba(254,250,244,0.35)", fontSize: "0.78rem", mt: 0.75, fontFamily: "monospace" }}>
                  {Number(trip.latitude).toFixed(4)}, {Number(trip.longitude).toFixed(4)}
                </Typography>
              )}
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Button
                variant="outlined"
                startIcon={<AutoFixHighIcon />}
                onClick={handleGenerate}
                disabled={generating}
                sx={{
                  color: "#FEFAF4",
                  borderColor: "rgba(254,250,244,0.30)",
                  "&:hover": {
                    borderColor: "rgba(254,250,244,0.60)",
                    background: "rgba(254,250,244,0.07)",
                  },
                }}
              >
                {generating ? "Generating…" : "Generate Itinerary"}
              </Button>
              <Tooltip title="Delete trip">
                <IconButton
                  onClick={handleDelete}
                  sx={{
                    color: "rgba(254,250,244,0.40)",
                    border: "1px solid rgba(254,250,244,0.15)",
                    borderRadius: "4px",
                    "&:hover": {
                      color: "#D05555",
                      borderColor: "rgba(208,85,85,0.40)",
                      background: "rgba(208,85,85,0.08)",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ pt: 5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Itinerary section header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", mb: 0.75, letterSpacing: "0.12em", fontSize: "0.72rem" }}
            >
              Day by day
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.1 }}
            >
              Itinerary
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/trips/${id}/plans/new`)}
          >
            Add Activity
          </Button>
        </Box>

        {/* Decorative rule */}
        <Box
          sx={{
            mb: 4,
            height: 1,
            background: "linear-gradient(90deg, #C17B2F 0%, rgba(193,123,47,0.15) 40%, transparent 100%)",
          }}
        />

        {/* Plans list or empty state */}
        {plans.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 8, md: 12 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              background: "#FEFAF4",
              border: "1px solid var(--pv-border)",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(193,123,47,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoFixHighIcon sx={{ color: "primary.main", fontSize: "1.5rem" }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontFamily: "'Playfair Display', serif", color: "text.primary" }}
            >
              No activities yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              Generate a template itinerary or add your own activities manually.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutoFixHighIcon />}
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? "Generating…" : "Generate Itinerary"}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/trips/${id}/plans/new`)}
              >
                Add Manually
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              background: "#FEFAF4",
              border: "1px solid var(--pv-border)",
              borderRadius: 2,
              p: { xs: 2.5, md: 3.5 },
            }}
          >
            {plans.map((plan, idx) => (
              <PlanItem
                key={plan.id}
                plan={plan}
                index={idx}
                onDelete={handleDeletePlan}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
