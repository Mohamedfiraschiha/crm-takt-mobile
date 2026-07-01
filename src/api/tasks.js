import { apiClient } from "./client";

// Backend: GET /api/tasks?status=&search= -> { tasks, pagination }
export const getTasks = async (params = {}) => {
  const { data } = await apiClient.get("/api/tasks", { params });
  return data;
};

// Backend: GET /api/tasks/:id -> task
export const getTask = async (id) => {
  const { data } = await apiClient.get(`/api/tasks/${id}`);
  return data;
};

// Backend: POST /api/tasks -> task (requires a "project" id)
export const createTask = async (payload) => {
  const { data } = await apiClient.post("/api/tasks", payload);
  return data;
};

// Backend: PUT /api/tasks/:id -> task
export const updateTask = async (id, payload) => {
  const { data } = await apiClient.put(`/api/tasks/${id}`, payload);
  return data;
};

// Backend: DELETE /api/tasks/:id
export const deleteTask = async (id) => {
  await apiClient.delete(`/api/tasks/${id}`);
};

// Backend: PATCH /api/tasks/:id/status { status } -> task
export const updateTaskStatus = async (id, status) => {
  const { data } = await apiClient.patch(`/api/tasks/${id}/status`, { status });
  return data;
};

// Backend: GET /api/tasks/statuses -> { statuses }
export const getTaskStatuses = async () => {
  const { data } = await apiClient.get("/api/tasks/statuses");
  return data.statuses;
};

// Backend: POST /api/tasks/:id/checklist { text } -> task
export const addChecklistItem = async (id, text) => {
  const { data } = await apiClient.post(`/api/tasks/${id}/checklist`, { text });
  return data;
};

// Backend: PATCH /api/tasks/:id/checklist/:itemId -> task (toggles completed)
export const toggleChecklistItem = async (id, itemId) => {
  const { data } = await apiClient.patch(`/api/tasks/${id}/checklist/${itemId}`);
  return data;
};

// Backend: POST /api/tasks/:id/comments { content } -> task
export const addTaskComment = async (id, content) => {
  const { data } = await apiClient.post(`/api/tasks/${id}/comments`, { content });
  return data;
};

// Backend: GET /api/projects -> { projects, pagination }
// Restricted to super_admin/administrateur/manager on the backend; other
// roles get a 403 which the task form surfaces as a normal error.
export const getProjects = async () => {
  const { data } = await apiClient.get("/api/projects");
  return data.projects;
};
