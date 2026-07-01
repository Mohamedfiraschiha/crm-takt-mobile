import React, { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import dayjs from "dayjs";
import { checkIn, checkOut, getTodayAttendance } from "../../api/hr";
import { getErrorMessage } from "../../api/errors";
import { colors, gradients, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const STATUS_LABELS = {
  present: "Présent",
  retard: "En retard",
  absent: "Absent",
  conge: "Congé",
};

// Resolves the device GPS position, surfacing permission/availability
// failures as regular errors instead of silently returning nothing.
const getCurrentPosition = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permission de localisation refusée");
  }
  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) {
    throw new Error("Le GPS est désactivé sur cet appareil");
  }
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return position.coords;
};

export default function PointageScreen({ navigation }) {
  const [attendance, setAttendance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await getTodayAttendance();
      setAttendance(result.attendance);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const handleCheckIn = async () => {
    setError("");
    setInfo("");
    setIsSubmitting(true);
    try {
      const coords = await getCurrentPosition();
      const result = await checkIn(coords.latitude, coords.longitude);
      setAttendance(result.attendance);
      setInfo(`Arrivée pointée (${result.distanceMeters} m du bureau)`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setError("");
    setInfo("");
    setIsSubmitting(true);
    try {
      const coords = await getCurrentPosition();
      const result = await checkOut(coords.latitude, coords.longitude);
      setAttendance(result.attendance);
      setInfo("Départ pointé avec succès");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Pointage" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const hasCheckedIn = !!attendance?.checkIn;
  const hasCheckedOut = !!attendance?.checkOut;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Pointage" onBackPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
      <Text style={styles.date}>{dayjs().format("dddd D MMMM YYYY")}</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Arrivée</Text>
          <Text style={styles.value}>
            {hasCheckedIn ? dayjs(attendance.checkIn).format("HH:mm") : "—"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Départ</Text>
          <Text style={styles.value}>
            {hasCheckedOut ? dayjs(attendance.checkOut).format("HH:mm") : "—"}
          </Text>
        </View>
        {!!attendance?.status && (
          <View style={styles.row}>
            <Text style={styles.label}>Statut</Text>
            <Text style={styles.value}>
              {STATUS_LABELS[attendance.status] || attendance.status}
            </Text>
          </View>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!info && <Text style={styles.info}>{info}</Text>}

      {!hasCheckedIn && (
        <GradientButton
          title="Pointer l'arrivée"
          onPress={handleCheckIn}
          loading={isSubmitting}
          colors={gradients.pinkButton}
        />
      )}

      {hasCheckedIn && !hasCheckedOut && (
        <GradientButton
          title="Pointer le départ"
          onPress={handleCheckOut}
          loading={isSubmitting}
          colors={[colors.textDark, "#1c5066", colors.primary]}
        />
      )}

      {hasCheckedIn && hasCheckedOut && (
        <Text style={styles.done}>Pointage du jour terminé.</Text>
      )}

      <Text style={styles.hint}>
        La vérification GPS confirme que vous êtes bien au bureau au moment du
        pointage.
      </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontFamily: "BarlowCondensed_700Bold",
    color: colors.textDark,
  },
  date: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: colors.textMuted,
    marginBottom: 16,
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: { color: colors.textMuted, fontSize: 14, fontFamily: "Manrope_400Regular" },
  value: { color: colors.textDark, fontSize: 14, fontFamily: "Manrope_700Bold" },
  done: {
    textAlign: "center",
    color: colors.green,
    fontFamily: "Manrope_700Bold",
    marginBottom: 12,
  },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  info: { color: colors.green, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  hint: {
    color: colors.textMuted,
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
