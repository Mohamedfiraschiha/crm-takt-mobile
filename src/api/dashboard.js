import { apiClient } from "./client";

// Each stats endpoint requires its own module permission (see backend
// accessControl). A user without access gets a 403 — treat that as "no data"
// rather than a fatal error so the dashboard still renders for every role.
const fetchOrNull = async (path) => {
  try {
    const { data } = await apiClient.get(path);
    return data.data ?? data;
  } catch (error) {
    if (error.response?.status === 403) return null;
    throw error;
  }
};

export const getClientStats = () => fetchOrNull("/api/clients/stats/counts");
export const getPipelineStats = () => fetchOrNull("/api/deals/stats");
export const getTaskStats = () => fetchOrNull("/api/tasks/stats");
export const getInvoiceStats = () => fetchOrNull("/api/invoices/stats");
export const getFinanceStats = () => fetchOrNull("/api/finance/stats");
export const getHRStats = () => fetchOrNull("/api/hr/stats");
