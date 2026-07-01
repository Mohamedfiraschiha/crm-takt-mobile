// Surfaces the most specific message available: backend message > axios
// network/timeout message > raw error string. Never hide the real cause.
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response) {
    return `Erreur serveur (${error.response.status})`;
  }
  if (error?.message) return error.message;
  return String(error);
};
