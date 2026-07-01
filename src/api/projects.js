import { apiClient } from "./client";

// Backend: GET /api/projects?search=&status= -> { projects, pagination }
// Restricted to super_admin/administrateur/manager.
export const getProjects = async (params = {}) => {
  const { data } = await apiClient.get("/api/projects", { params });
  return data;
};

// Backend: GET /api/projects/:id -> project
export const getProject = async (id) => {
  const { data } = await apiClient.get(`/api/projects/${id}`);
  return data;
};

// Backend: POST /api/projects { name, client, code?, ... } -> project
export const createProject = async (payload) => {
  const { data } = await apiClient.post("/api/projects", payload);
  return data;
};

// Backend: PUT /api/projects/:id -> project
export const updateProject = async (id, payload) => {
  const { data } = await apiClient.put(`/api/projects/${id}`, payload);
  return data;
};

// Backend: PATCH /api/projects/:id/archive
export const archiveProject = async (id) => {
  await apiClient.patch(`/api/projects/${id}/archive`);
};

// Backend: DELETE /api/projects/:id
export const deleteProject = async (id) => {
  await apiClient.delete(`/api/projects/${id}`);
};
