import api from "./client";

export const getPlans = (tripId) => api.get(`/trips/${tripId}/plans`);

export const createPlan = (tripId, data) =>
  api.post(`/trips/${tripId}/plans`, data);

export const updatePlan = (tripId, planId, data) =>
  api.put(`/trips/${tripId}/plans/${planId}`, data);

export const patchPlan = (tripId, planId, data) =>
  api.patch(`/trips/${tripId}/plans/${planId}`, data);

export const deletePlan = (tripId, planId) =>
  api.delete(`/trips/${tripId}/plans/${planId}`);

export const generatePlans = (tripId, replace = false) =>
  api.post(`/trips/${tripId}/plans/generate${replace ? "?replace=true" : ""}`);
