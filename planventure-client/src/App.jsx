import { Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TripsPage from "./pages/TripsPage";
import NewTripPage from "./pages/NewTripPage";
import TripDetailPage from "./pages/TripDetailPage";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Box component="main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <TripsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/new"
            element={
              <PrivateRoute>
                <NewTripPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <PrivateRoute>
                <TripDetailPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;
