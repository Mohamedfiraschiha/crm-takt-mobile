// Mirrors the brand palette defined in crm-takt-front (Dashboard.css / Auth.css)
// so the mobile app shares the same visual identity as the web CRM.
export const colors = {
  primary: "#37c6f5",
  primaryHover: "#20b6e8",
  pink: "#ff1f8f",
  pinkSoft: "#ff44aa",
  indigo: "#7082ff",
  yellow: "#fdb022",
  green: "#24b47e",
  background: "#f4f9fc",
  card: "#ffffff",
  textDark: "#103b4c",
  textMuted: "#5f7986",
  border: "#d7e4ec",
  error: "#ff4d4f",
};

export const gradients = {
  pinkButton: [colors.pink, colors.pinkSoft, "#ff6cc7"],
  avatar: [colors.pink, colors.indigo, colors.primary],
};

export const radii = {
  sm: 8,
  md: 10,
  lg: 14,
};
