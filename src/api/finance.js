import { apiClient } from "./client";

// ---------- Comptes bancaires ----------
export const getBankAccounts = async (params = {}) => {
  const { data } = await apiClient.get("/api/finance/comptes-bancaires", { params });
  return data;
};
export const getBankAccount = async (id) => {
  const { data } = await apiClient.get(`/api/finance/comptes-bancaires/${id}`);
  return data;
};
export const createBankAccount = async (payload) => {
  const { data } = await apiClient.post("/api/finance/comptes-bancaires", payload);
  return data;
};
export const updateBankAccount = async (id, payload) => {
  const { data } = await apiClient.put(`/api/finance/comptes-bancaires/${id}`, payload);
  return data;
};
export const deleteBankAccount = async (id) => {
  await apiClient.delete(`/api/finance/comptes-bancaires/${id}`);
};

// ---------- Fournisseurs ----------
export const getSuppliers = async (params = {}) => {
  const { data } = await apiClient.get("/api/finance/fournisseurs", { params });
  return data;
};
export const getSupplier = async (id) => {
  const { data } = await apiClient.get(`/api/finance/fournisseurs/${id}`);
  return data;
};
export const createSupplier = async (payload) => {
  const { data } = await apiClient.post("/api/finance/fournisseurs", payload);
  return data;
};
export const updateSupplier = async (id, payload) => {
  const { data } = await apiClient.put(`/api/finance/fournisseurs/${id}`, payload);
  return data;
};
export const deleteSupplier = async (id) => {
  await apiClient.delete(`/api/finance/fournisseurs/${id}`);
};

// ---------- Commandes fournisseurs ----------
export const getSupplierOrders = async (params = {}) => {
  const { data } = await apiClient.get("/api/finance/commandes-fournisseurs", { params });
  return data;
};
export const getSupplierOrder = async (id) => {
  const { data } = await apiClient.get(`/api/finance/commandes-fournisseurs/${id}`);
  return data;
};
export const createSupplierOrder = async (payload) => {
  const { data } = await apiClient.post("/api/finance/commandes-fournisseurs", payload);
  return data;
};
export const updateSupplierOrder = async (id, payload) => {
  const { data } = await apiClient.put(`/api/finance/commandes-fournisseurs/${id}`, payload);
  return data;
};
export const deleteSupplierOrder = async (id) => {
  await apiClient.delete(`/api/finance/commandes-fournisseurs/${id}`);
};

// ---------- Encaissements ----------
export const getEncaissements = async (params = {}) => {
  const { data } = await apiClient.get("/api/finance/encaissements", { params });
  return data;
};
export const getEncaissement = async (id) => {
  const { data } = await apiClient.get(`/api/finance/encaissements/${id}`);
  return data;
};
export const createEncaissement = async (payload) => {
  const { data } = await apiClient.post("/api/finance/encaissements", payload);
  return data;
};
export const updateEncaissement = async (id, payload) => {
  const { data } = await apiClient.put(`/api/finance/encaissements/${id}`, payload);
  return data;
};
export const deleteEncaissement = async (id) => {
  await apiClient.delete(`/api/finance/encaissements/${id}`);
};

// ---------- Décaissements ----------
export const getDecaissements = async (params = {}) => {
  const { data } = await apiClient.get("/api/finance/decaissements", { params });
  return data;
};
export const getDecaissement = async (id) => {
  const { data } = await apiClient.get(`/api/finance/decaissements/${id}`);
  return data;
};
export const createDecaissement = async (payload) => {
  const { data } = await apiClient.post("/api/finance/decaissements", payload);
  return data;
};
export const updateDecaissement = async (id, payload) => {
  const { data } = await apiClient.put(`/api/finance/decaissements/${id}`, payload);
  return data;
};
export const validateDecaissement = async (id, status, decisionComment) => {
  const { data } = await apiClient.patch(`/api/finance/decaissements/${id}/validation`, {
    status,
    decisionComment,
  });
  return data;
};
export const deleteDecaissement = async (id) => {
  await apiClient.delete(`/api/finance/decaissements/${id}`);
};

// ---------- Trésorerie ----------
export const getTresorerieEntries = async (params = {}) => {
  const { data } = await apiClient.get("/api/finance/tresorerie", { params });
  return data;
};
export const getTresorerieEntry = async (id) => {
  const { data } = await apiClient.get(`/api/finance/tresorerie/${id}`);
  return data;
};
export const createTresorerieEntry = async (payload) => {
  const { data } = await apiClient.post("/api/finance/tresorerie", payload);
  return data;
};
export const updateTresorerieEntry = async (id, payload) => {
  const { data } = await apiClient.put(`/api/finance/tresorerie/${id}`, payload);
  return data;
};
export const deleteTresorerieEntry = async (id) => {
  await apiClient.delete(`/api/finance/tresorerie/${id}`);
};

// ---------- Stats ----------
export const getFinanceStats = async () => {
  const { data } = await apiClient.get("/api/finance/stats");
  return data;
};
