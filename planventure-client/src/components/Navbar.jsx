import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <FlightTakeoffIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          PlanVenture
        </Typography>
        {isAuthenticated ? (
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
