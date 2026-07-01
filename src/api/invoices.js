import { apiClient } from "./client";

// Backend: GET /api/invoices?type=&status=&search= -> { invoices, pagination }
export const getInvoices = async (params = {}) => {
  const { data } = await apiClient.get("/api/invoices", { params });
  return data;
};

// Backend: GET /api/invoices/:id -> invoice
export const getInvoice = async (id) => {
  const { data } = await apiClient.get(`/api/invoices/${id}`);
  return data;
};

// Backend: POST /api/invoices { type, client, items, taxRate, dueDate, notes } -> invoice
export const createInvoice = async (payload) => {
  const { data } = await apiClient.post("/api/invoices", payload);
  return data;
};

// Backend: PUT /api/invoices/:id -> invoice
export const updateInvoice = async (id, payload) => {
  const { data } = await apiClient.put(`/api/invoices/${id}`, payload);
  return data;
};

// Backend: DELETE /api/invoices/:id
export const deleteInvoice = async (id) => {
  await apiClient.delete(`/api/invoices/${id}`);
};

// Backend: POST /api/invoices/:id/convert-to-invoice -> { message, invoice, quote }
export const convertQuoteToInvoice = async (id) => {
  const { data } = await apiClient.post(`/api/invoices/${id}/convert-to-invoice`);
  return data;
};

// Backend: POST /api/invoices/:id/send-to-client -> { message, ... }
export const sendQuoteToClient = async (id) => {
  const { data } = await apiClient.post(`/api/invoices/${id}/send-to-client`);
  return data;
};
