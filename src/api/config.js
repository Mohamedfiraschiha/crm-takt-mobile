import { Platform } from "react-native";

// Backend runs on http://localhost:5000 (see crm-takt-back/.env / docker-compose.yml).
// Emulators/devices can't reach "localhost" on the host machine, so pick the
// right address per platform. Override anytime with EXPO_PUBLIC_API_URL.
const DEV_HOST =
  Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${DEV_HOST}:5000`;
