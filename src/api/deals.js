import { apiClient } from "./client";

// Backend: GET /api/deals?stage=&search= -> { success, data: { deals, pagination } }
export const getDeals = async (params = {}) => {
  const { data } = await apiClient.get("/api/deals", { params });
  return data.data;
};

// Backend: GET /api/deals/:id -> { success, data: deal }
export const getDeal = async (id) => {
  const { data } = await apiClient.get(`/api/deals/${id}`);
  return data.data;
};

// Backend: POST /api/deals -> { success, data: deal }
export const createDeal = async (payload) => {
  const { data } = await apiClient.post("/api/deals", payload);
  return data.data;
};

// Backend: PUT /api/deals/:id -> { success, data: deal }
export const updateDeal = async (id, payload) => {
  const { data } = await apiClient.put(`/api/deals/${id}`, payload);
  return data.data;
};

// Backend: DELETE /api/deals/:id
export const deleteDeal = async (id) => {
  await apiClient.delete(`/api/deals/${id}`);
};

// Backend: PATCH /api/deals/:id/stage { stage } -> { success, data: deal }
export const updateDealStage = async (id, stage) => {
  const { data } = await apiClient.patch(`/api/deals/${id}/stage`, { stage });
  return data.data;
};

// Backend: POST /api/deals/:id/convert-to-client -> { success, data: { client, project? } }
export const convertDealToClient = async (id) => {
  const { data } = await apiClient.post(`/api/deals/${id}/convert-to-client`);
  return data.data;
};

// Backend: POST /api/deals/:id/notes { content } -> { success, data: deal }
export const addDealNote = async (id, content) => {
  const { data } = await apiClient.post(`/api/deals/${id}/notes`, { content });
  return data.data;
};

// Backend: POST /api/deals/:id/activities { type, description, date } -> { success, data: deal }
export const addDealActivity = async (id, payload) => {
  const { data } = await apiClient.post(`/api/deals/${id}/activities`, payload);
  return data.data;
};
