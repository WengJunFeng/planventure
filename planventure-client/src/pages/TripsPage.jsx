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
import PlaceIcon from "@mui/icons-material/Place";
import { getTrips } from "../api/trips";

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
    <Container sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">My Trips</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/trips/new")}
        >
          New Trip
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {trips.length === 0 && !error && (
        <Typography color="text.secondary" textAlign="center" sx={{ mt: 8 }}>
          No trips yet. Create your first one!
        </Typography>
      )}

      <Grid container spacing={3}>
        {trips.map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <Card elevation={2}>
              <CardActionArea onClick={() => navigate(`/trips/${trip.id}`)}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <PlaceIcon color="primary" />
                    <Typography variant="h6" noWrap>
                      {trip.destination}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {trip.start_date} → {trip.end_date}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 32, right: 32 }}
        onClick={() => navigate("/trips/new")}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
