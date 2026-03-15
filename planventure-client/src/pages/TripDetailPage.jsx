import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PlaceIcon from "@mui/icons-material/Place";
import { getTrip, deleteTrip } from "../api/trips";
import { getPlans, generatePlans, deletePlan } from "../api/plans";

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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  if (!trip)
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        Trip not found.
      </Alert>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Trip header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PlaceIcon color="primary" />
              <Typography variant="h4">{trip.destination}</Typography>
            </Box>
            <Typography color="text.secondary">
              {trip.start_date} → {trip.end_date}
            </Typography>
            {trip.latitude && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {trip.latitude}, {trip.longitude}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AutoFixHighIcon />}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Generating…" : "Generate Itinerary"}
            </Button>
            <IconButton color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Plans list */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h5">Itinerary</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => navigate(`/trips/${id}/plans/new`)}
        >
          Add Activity
        </Button>
      </Box>

      <Paper elevation={1}>
        {plans.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3 }} textAlign="center">
            No activities yet. Generate a template or add one manually.
          </Typography>
        ) : (
          <List disablePadding>
            {plans.map((plan, idx) => (
              <Box key={plan.id}>
                {idx > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {plan.plan_time && (
                          <Chip
                            label={plan.plan_time}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        <Typography variant="body1">
                          {plan.plan_activity}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {plan.plan_location_from && (
                          <Typography variant="body2" color="text.secondary">
                            From: {plan.plan_location_from}
                          </Typography>
                        )}
                        {plan.plan_location_to && (
                          <Typography variant="body2" color="text.secondary">
                            To: {plan.plan_location_to}
                          </Typography>
                        )}
                        {plan.plan_traffic && (
                          <Chip
                            label={plan.plan_traffic}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                        {plan.plan_note && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {plan.plan_note}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
