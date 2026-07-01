import { apiClient } from "./client";

// Backend: GET /api/clients?search=&statut=&page=&limit= -> { success, data: { clients, pagination } }
export const getClients = async (params = {}) => {
  const { data } = await apiClient.get("/api/clients", { params });
  return data.data;
};

// Backend: GET /api/clients/:id -> { success, data: { client } }
export const getClient = async (id) => {
  const { data } = await apiClient.get(`/api/clients/${id}`);
  return data.data.client;
};

// Backend: POST /api/clients { entreprise, email, telephone, localite, ... }
export const createClient = async (payload) => {
  const { data } = await apiClient.post("/api/clients", payload);
  return data.data.client;
};

// Backend: PUT /api/clients/:id
export const updateClient = async (id, payload) => {
  const { data } = await apiClient.put(`/api/clients/${id}`, payload);
  return data.data.client;
};

// Backend: DELETE /api/clients/:id -> super_admin/administrateur/manager only
export const deleteClient = async (id) => {
  await apiClient.delete(`/api/clients/${id}`);
};

// Backend: POST /api/clients/:id/interactions { type, summary, date }
// -> { success, data: { clientId, interactions } } (latest 20 interactions, not the full client)
export const addClientInteraction = async (id, payload) => {
  const { data } = await apiClient.post(
    `/api/clients/${id}/interactions`,
    payload,
  );
  return data.data;
};
