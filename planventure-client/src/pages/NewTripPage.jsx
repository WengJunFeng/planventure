import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createTrip } from "../api/trips";

export default function NewTripPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    destination: "",
    start_date: "",
    end_date: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        destination: form.destination,
        start_date: form.start_date,
        end_date: form.end_date,
        ...(form.latitude && { latitude: parseFloat(form.latitude) }),
        ...(form.longitude && { longitude: parseFloat(form.longitude) }),
      };
      const res = await createTrip(payload);
      navigate(`/trips/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create trip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          New Trip
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Destination"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Start Date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleChange}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="End Date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleChange}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Latitude"
              name="latitude"
              type="number"
              value={form.latitude}
              onChange={handleChange}
              fullWidth
              slotProps={{ htmlInput: { step: "any" } }}
            />
            <TextField
              label="Longitude"
              name="longitude"
              type="number"
              value={form.longitude}
              onChange={handleChange}
              fullWidth
              slotProps={{ htmlInput: { step: "any" } }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? "Creating…" : "Create Trip"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
