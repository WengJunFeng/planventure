import axios from "axios";

// Auth calls go to /auth (not /api), so use a separate instance
const authClient = axios.create({
  baseURL: "/auth",
  headers: { "Content-Type": "application/json" },
});

export const register = (email, password) =>
  authClient.post("/register", { email, password });

export const login = (email, password) =>
  authClient.post("/login", { email, password });
