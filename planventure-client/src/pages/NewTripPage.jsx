import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
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

const DEFAULT_CENTER = { lat: 20, lng: 0 };
const DEFAULT_ZOOM = 2;

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
      placeholder="Search destination…"
      style={{
        width: "100%",
        padding: "12px 16px",
        fontSize: "0.9rem",
        fontFamily: "'DM Sans', sans-serif",
        borderRadius: "4px",
        border: "1.5px solid #D5C9BC",
        backgroundColor: "#FEFAF4",
        color: "#1C1A17",
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#C17B2F";
        e.target.style.boxShadow = "0 0 0 3px rgba(193,123,47,0.12)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#D5C9BC";
        e.target.style.boxShadow = "none";
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
  const [marker, setMarker] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleMapClick = useCallback((e) => {
    const lat = e.detail?.latLng?.lat;
    const lng = e.detail?.latLng?.lng;
    if (lat == null || lng == null) return;
    setMarker({ lat, lng });
  }, []);

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
    <Box
      className="pv-page-enter"
      sx={{ minHeight: "calc(100vh - 64px)", background: "var(--pv-cream)", pb: 8 }}
    >
      <Container maxWidth="md" sx={{ pt: { xs: 4, md: 6 } }}>

        {/* Back link */}
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: "1rem !important" }} />}
          onClick={() => navigate("/")}
          sx={{
            mb: 3,
            color: "text.secondary",
            fontWeight: 500,
            fontSize: "0.875rem",
            p: 0,
            "&:hover": { color: "text.primary", background: "transparent" },
          }}
        >
          Back to trips
        </Button>

        {/* Page header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "primary.main", mb: 1, letterSpacing: "0.12em", fontSize: "0.72rem" }}
          >
            New adventure
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            Plan a Trip
          </Typography>
          <Box
            sx={{
              mt: 2,
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

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {/* Section: Trip Details */}
          <Box
            sx={{
              background: "#FEFAF4",
              border: "1px solid var(--pv-border)",
              borderRadius: 2,
              p: { xs: 3, md: 4 },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", mb: 2.5, letterSpacing: "0.1em", fontSize: "0.72rem" }}
            >
              Trip Details
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Destination"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                required
                fullWidth
                autoFocus
                placeholder="e.g. Tokyo, Japan"
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
            </Box>
          </Box>

          {/* Section: Map */}
          <Box
            sx={{
              background: "#FEFAF4",
              border: "1px solid var(--pv-border)",
              borderRadius: 2,
              p: { xs: 3, md: 4 },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", mb: 0.5, letterSpacing: "0.1em", fontSize: "0.72rem" }}
            >
              Location
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: "0.82rem" }}>
              Search for a place or click the map to drop a pin.
            </Typography>

            <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
              <Box sx={{ mb: 2 }}>
                <PlacesSearchBox onPlaceSelected={handlePlaceSelected} />
              </Box>

              <Box
                sx={{
                  borderRadius: "6px",
                  overflow: "hidden",
                  border: "1.5px solid var(--pv-border)",
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

              {/* Coordinates row */}
              <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <MyLocationIcon fontSize="small" sx={{ color: "text.disabled", fontSize: "1rem" }} />
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
                      sx={{ ml: "auto", fontWeight: 500 }}
                    >
                      Clear pin
                    </Button>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: "text.disabled", fontSize: "0.8rem" }}>
                    No location selected
                  </Typography>
                )}
              </Box>
            </APIProvider>
          </Box>

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ py: 1.5, fontSize: "0.95rem" }}
          >
            {loading ? "Creating trip…" : "Create Trip"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
