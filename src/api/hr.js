import { apiClient } from "./client";

// Backend: GET /api/hr/attendance/today -> { success, data: { attendance, office } }
export const getTodayAttendance = async () => {
  const { data } = await apiClient.get("/api/hr/attendance/today");
  return data.data;
};

// Backend: POST /api/hr/attendance/check-in { lat, lng } -> { success, data: { attendance, distanceMeters } }
export const checkIn = async (lat, lng) => {
  const { data } = await apiClient.post("/api/hr/attendance/check-in", {
    lat,
    lng,
  });
  return data.data;
};

// Backend: POST /api/hr/attendance/check-out { lat, lng } -> { success, data: { attendance, distanceMeters } }
export const checkOut = async (lat, lng) => {
  const { data } = await apiClient.post("/api/hr/attendance/check-out", {
    lat,
    lng,
  });
  return data.data;
};

// Backend: GET /api/hr/attendance?mine=true -> always scoped to the caller's own records
export const getAttendanceHistory = async () => {
  const { data } = await apiClient.get("/api/hr/attendance?mine=true");
  return data.data.attendance;
};

// Backend: GET /api/hr/leaves -> full list (admin/manager) for the approvals screen
export const getLeaves = async () => {
  const { data } = await apiClient.get("/api/hr/leaves");
  return data.data.leaves;
};

// Backend: GET /api/hr/leaves?mine=true -> always scoped to the caller's own requests
export const getMyLeaves = async () => {
  const { data } = await apiClient.get("/api/hr/leaves?mine=true");
  return data.data.leaves;
};

// Backend: POST /api/hr/leaves { type, startDate, endDate, reason }
export const createLeave = async (payload) => {
  const { data } = await apiClient.post("/api/hr/leaves", payload);
  return data.data.leave;
};

// Backend: GET /api/hr/leave-balances?mine=true -> always scoped to the caller's own balance
export const getLeaveBalances = async () => {
  const { data } = await apiClient.get("/api/hr/leave-balances?mine=true");
  return data.data.leaveBalances;
};

// Backend: GET /api/hr/employees -> full list for admin/manager, own profile only for "employe"
export const getEmployees = async () => {
  const { data } = await apiClient.get("/api/hr/employees");
  return data.data.employees;
};

// Backend: PATCH /api/hr/leaves/:id/status { status, decisionComment } -> admin/manager only
export const updateLeaveStatus = async (id, status, decisionComment) => {
  const { data } = await apiClient.patch(`/api/hr/leaves/${id}/status`, {
    status,
    decisionComment,
  });
  return data.data.leave;
};
