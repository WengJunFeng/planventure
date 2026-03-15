import api from "./client";

export const getTrips = () => api.get("/trips");

export const getTrip = (id) => api.get(`/trips/${id}`);

export const createTrip = (data) => api.post("/trips", data);

export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);

export const patchTrip = (id, data) => api.patch(`/trips/${id}`, data);

export const deleteTrip = (id) => api.delete(`/trips/${id}`);
