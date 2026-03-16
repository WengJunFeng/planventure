import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { createTrip } from "../api/trips";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Default center: world view
const DEFAULT_CENTER = { lat: 20, lng: 0 };
const DEFAULT_ZOOM = 2;

// Search box wired to Google Places Autocomplete
function PlacesSearchBox({ onPlaceSelected }) {
  const map = useMap();
  const places = useMapsLibrary("places");
  const [inputRef, setInputRef] = useState(null);

  const initAutocomplete = useCallback(
    (el) => {
      if (!el || !places || inputRef) return;
      setInputRef(el);
      const autocomplete = new places.Autocomplete(el, {
        fields: ["geometry", "name", "formatted_address"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onPlaceSelected({
          lat,
          lng,
          name: place.formatted_address || place.name || "",
        });
        map?.panTo({ lat, lng });
        map?.setZoom(12);
      });
    },
    [places, map, onPlaceSelected, inputRef],
  );

  return (
    <input
      ref={initAutocomplete}
      type="text"
      placeholder="Search for a destination…"
      style={{
        width: "100%",
        padding: "10px 14px",
        fontSize: 14,
        borderRadius: 8,
        border: "1px solid #ccc",
        boxSizing: "border-box",
        outline: "none",
      }}
    />
  );
}

export default function NewTripPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    destination: "",
    start_date: "",
    end_date: "",
  });
  const [marker, setMarker] = useState(null); // { lat, lng }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Click on map → drop a pin
  const handleMapClick = useCallback((e) => {
    const lat = e.detail?.latLng?.lat;
    const lng = e.detail?.latLng?.lng;
    if (lat == null || lng == null) return;
    setMarker({ lat, lng });
  }, []);

  // Place selected from autocomplete search box
  const handlePlaceSelected = useCallback(
    ({ lat, lng, name }) => {
      setMarker({ lat, lng });
      if (name && !form.destination) {
        setForm((prev) => ({ ...prev, destination: name }));
      }
    },
    [form.destination],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        destination: form.destination,
        start_date: form.start_date,
        end_date: form.end_date,
        ...(marker && { latitude: marker.lat, longitude: marker.lng }),
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
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
          {/* Basic fields */}
          <TextField
            label="Destination"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            required
            fullWidth
            autoFocus
          />
          <Box sx={{ display: "flex", gap: 2 }}>
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
          </Box>

          {/* Map section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Pick location on map <em>(click to drop a pin)</em>
            </Typography>

            <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
              {/* Places search box */}
              <Box sx={{ mb: 1 }}>
                <PlacesSearchBox onPlaceSelected={handlePlaceSelected} />
              </Box>

              {/* Map */}
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  height: 380,
                }}
              >
                <Map
                  defaultCenter={DEFAULT_CENTER}
                  defaultZoom={DEFAULT_ZOOM}
                  mapId="planventure-trip-map"
                  onClick={handleMapClick}
                  style={{ width: "100%", height: "100%" }}
                >
                  {marker && (
                    <AdvancedMarker
                      position={marker}
                      title="Trip destination"
                    />
                  )}
                </Map>
              </Box>
            </APIProvider>

            {/* Coordinate display */}
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <MyLocationIcon fontSize="small" color="action" />
              {marker ? (
                <>
                  <Chip
                    size="small"
                    label={`Lat: ${marker.lat.toFixed(6)}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`Lng: ${marker.lng.toFixed(6)}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setMarker(null)}
                    sx={{ ml: "auto" }}
                  >
                    Clear pin
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No location selected
                </Typography>
              )}
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? "Creating…" : "Create Trip"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
